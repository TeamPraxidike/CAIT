import {
	coverPicFetcher,
	deleteMaterialByPublicationId,
	type FetchedFileArray,
	type FetchedFileItem,
	type FileDiffActions,
	fileSystem,
	getMaterialByPublicationId,
	getPublisherId,
	handleConnections,
	type MaterialForm,
	prisma,
	updateCoverPic,
	updateFiles,
	updateMaterialByPublicationId,
} from '$lib/database';

import {
	type File as PrismaFile,
	Prisma,
	type PrismaClient,
	PublicationEventType,
} from '@prisma/client';
import {
	canEditOrRemove,
	unauthResponse,
	verifyAuth,
} from '$lib/database/auth';

import { enqueueMaterialComparison } from '$lib/PiscinaUtils/runner';
import { getMaintainers, getPublisher } from '$lib/database/publication';
import { SupabaseFileSystem } from '$lib/FileSystemPort/SupabaseFileSystem';
import { profilePicFetcher } from '$lib/database/file';
import {
	createActorSnapshot,
	type ChangeLogPayload,
	type FileChangeLog,
} from '$lib/database/publicationHistory.js';

export async function GET({ params, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const publicationId = parseInt(params.publicationId);

	if (isNaN(publicationId) || publicationId <= 0) {
		return new Response(
			JSON.stringify({ error: 'Bad Request - Invalid ID' }),
			{
				status: 400,
			},
		);
	}

	try {
		const material = await getMaterialByPublicationId(publicationId);
		if (!material) {
			return new Response(
				JSON.stringify({ error: 'Material Not Found' }),
				{
					status: 404,
				},
			);
		}

		// file content for return
		const fileData: FetchedFileArray = [];

		for (const file of material.files) {
			//const currentFileData = await fileSystem.readFile(file.path);
			if (fileSystem instanceof SupabaseFileSystem) {
				const currentFileData = await fileSystem.readFileURL(file.path);
				fileData.push({
					fileId: file.path,
					name: file.title,
					type: file.type,
					data: currentFileData,
				});
			}
			// TODO: This will break on the frontend (when using LocalFileSystem)
			// Because the system expects urls, not base64 strings
			else {
				const currentFileData = await fileSystem.readFile(file.path);
				fileData.push({
					fileId: file.path,
					name: file.title,
					type: file.type,
					data: currentFileData.toString('base64'), //skipcheck
				});
			}
		}

		// coverPic
		const coverFileData: FetchedFileItem = await coverPicFetcher(
			material.encapsulatingType,
			material.publication.coverPic,
		);

		// publisher profile pic
		// TODO: this needs a type, not questionable type assertions
		(material.publication.publisher as any).profilePicData =
			await profilePicFetcher(material.publication.publisher.profilePic);

		return new Response(
			JSON.stringify({ material, fileData, coverFileData }),
			{
				status: 200,
			},
		);
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}

export async function PUT({ request, params, locals }) {
	// Parse the body
	const body: MaterialForm & {
		materialId: number;
		publisherId: string;
	} = await request.json();

	const { metaData, publisherId, coverPic, fileDiff, userId, materialId } =
		body;

	const tags = metaData.tags;
	const maintainers = metaData.maintainers;

	// format: { globalComment: string, fileComments: { [fileName]: string } }
	const changeLog: ChangeLogPayload = body.changeLog || {
		globalComment: '',
		fileComments: {},
	};

	const authError = await verifyAuth(locals, body.userId);
	if (authError) return authError;

	const publicationId = parseInt(params.publicationId);

	if (isNaN(publicationId) || publicationId <= 0) {
		return new Response(
			JSON.stringify({ error: 'Bad Request - Invalid ID' }),
			{
				status: 400,
			},
		);
	}

	try {
		// TODO: should we trust frontend for this info? Probably not...
		const maintainerIds =
			(await getMaintainers(publicationId))?.maintainers?.map(
				(m) => m.id,
			) || [];
		const publisher = await getPublisher(publicationId);
		const publisherId = publisher?.publisher?.id;

		if (!publisherId) {
			return new Response(
				JSON.stringify({ error: 'Publisher not found' }),
				{ status: 404 },
			);
		}

		if (
			!(await canEditOrRemove(locals, publisherId, maintainerIds, 'EDIT'))
		)
			return unauthResponse();

		// Prepare the history data for the changelog
		const fileChangesLog: FileChangeLog[] = [];

		// Handle added files
		if (fileDiff.add && fileDiff.add.length > 0) {
			for (const file of fileDiff.add) {
				fileChangesLog.push({
					fileName: file.title,
					fileType: file.type,
					action: 'CREATED',
					comment: changeLog.fileComments?.[file.title] || '',
				});
			}
		}

		// Handle deleted files
		if (fileDiff.delete && fileDiff.delete.length > 0) {
			for (const fileToDelete of fileDiff.delete) {
				// Try to find the file in DB to get its human-readable title
				const dbFile = await prisma.file.findUnique({
					where: { path: fileToDelete.path },
					select: { title: true, type: true},
				});

				const fileName = dbFile?.title || '';
				const fileType = dbFile?.type || '';

				fileChangesLog.push({
					fileName: fileName,
					fileType: fileType,
					action: 'DELETED',
					comment: changeLog.fileComments?.[fileName] || '',
				});
			}
		}

		// Perform actual updates to the publication elements
		const updatedMaterial = await prisma.$transaction(
			async (prismaTransaction: PrismaClient) => {
				await handleConnections(
					tags,
					maintainers,
					publicationId,
					prismaTransaction,
				);

				return await updateMaterialByPublicationId(
					publicationId,
					metaData,
					prismaTransaction,
				);
			},
		);

		await updateCoverPic(coverPic, publicationId, body.userId);

		await updateFiles(fileDiff, body.materialId, body.userId);

		// Write the history log
		const hasMaterialChanges = fileChangesLog.length > 0;
		const hasGlobalComment = !!changeLog.globalComment;

		// Log if files changed or if user wrote comment about the update
		if (hasMaterialChanges || hasGlobalComment) {
			const sessionUser = locals.session?.user;

			await prisma.publicationHistory.create({
				data: {
					action: PublicationEventType.UPDATE,
					publicationId: publicationId,
					userId: userId,

					comment: changeLog.globalComment,

					meta: {
						actorSnapshot: createActorSnapshot(sessionUser),
						fileChanges: fileChangesLog,
					},
				},
			});
		}

		const materialId = updatedMaterial.id;

		// enqueueMaterialComparison(publicationId, materialId).catch(error => console.error(error))
		setTimeout(() => {
			enqueueMaterialComparison(publicationId, materialId).catch(
				(error) => {
					console.error(error);
				},
			);
		}, 2000);

		return new Response(JSON.stringify({ id: publicationId }), {
			status: 200,
		});
	} catch (error) {
		console.error(error);
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === 'P2025'
		) {
			return new Response(
				JSON.stringify({ error: 'Material not found' }),
				{
					status: 404,
				},
			);
		}
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}

// @note: This endpoint does not need the log to be updates as it also deletes the publication which cascades to the history logs
export async function DELETE({ params, locals }) {
	const publicationId = parseInt(params.publicationId);

	if (isNaN(publicationId) || publicationId <= 0) {
		return new Response(
			JSON.stringify({
				error: 'Bad Delete Request - Invalid Material publication Id',
			}),
			{ status: 400 },
		);
	}

	const publication = await getPublisherId(publicationId);
	const authError = await verifyAuth(locals, publication.publisherId);
	if (authError) return authError;

	try {
		// TODO: should we trust frontend for this info? Probably not...
		const maintainerIds =
			(await getMaintainers(publicationId))?.maintainers?.map(
				(m) => m.id,
			) || [];
		const publisher = await getPublisher(publicationId);
		const publisherId = publisher?.publisher?.id;

		if (
			!(await canEditOrRemove(
				locals,
				publisherId,
				maintainerIds,
				'REMOVE',
			))
		)
			return unauthResponse();

		const material = await prisma.$transaction(
			async (prismaTransaction: PrismaClient) => {
				const publication = await deleteMaterialByPublicationId(
					publicationId,
					prismaTransaction,
				);

				const coverPic: PrismaFile = publication.coverPic;

				// if there is a coverPic, delete
				if (coverPic) {
					fileSystem.deleteFile(coverPic.path);
				}

				// delete all files
				for (const file of publication.materials!.files) {
					fileSystem.deleteFile(file.path);
				}

				return publication.materials;
			},
		);

		return new Response(JSON.stringify(material), { status: 200 });
	} catch (error) {
		console.error(error);
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === 'P2025'
		) {
			return new Response(
				JSON.stringify({ error: 'Material not found' }),
				{
					status: 404,
				},
			);
		}
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}
