import {
	coverPicFetcher,
	archivePublication,
	type FetchedFileArray,
	type FetchedFileItem,
	fileSystem,
	getMaterialByPublicationId,
	getPublicationByIdLight,
	getPublisherId,
	handleConnections,
	type MaterialForm,
	prisma,
	updateCoverPic,
	updateFiles,
	updateMaterialByPublicationId,
} from '$lib/database';

import {
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
	if (!(await getPublicationByIdLight(publicationId))) {
		return new Response(JSON.stringify({ error: 'Material Not Found' }), {
			status: 404,
		});
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

	// format: { globalComment: string, fileComments: { added: { [fileName]: string }, deleted: { [fileName]: string } } }
	const changeLog: ChangeLogPayload = body.changeLog || {
		globalComment: '',
		fileComments: { added: {}, deleted: {} },
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
	if (!(await getPublicationByIdLight(publicationId))) {
		return new Response(JSON.stringify({ error: 'Material not found' }), {
			status: 404,
		});
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
					comment: changeLog.fileComments?.added?.[file.title] || '',
				});
			}
		}

		// Handle deleted files
		if (fileDiff.delete && fileDiff.delete.length > 0) {
			for (const fileToDelete of fileDiff.delete) {
				// Try to find the file in DB to get its human-readable title
				const dbFile = await prisma.file.findUnique({
					where: { path: fileToDelete.path },
					select: { title: true, type: true },
				});

				if (!dbFile) {
					console.warn(
						`Skipping log for file path not found in DB: ${fileToDelete.path}`,
					);
					continue;
				}

				const fileName = dbFile.title;
				const fileType = dbFile.type;

				fileChangesLog.push({
					fileName: fileName,
					fileType: fileType,
					action: 'DELETED',
					comment: changeLog.fileComments?.deleted?.[fileName] || '',
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
			await prisma.publicationHistory.create({
				data: {
					action: PublicationEventType.UPDATE,
					publicationId: publicationId,
					userId: userId,

					comment: changeLog.globalComment || '',

					meta: {
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

// DELETE is intentionally implemented as a reversible archive operation.
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
	if (!publication) {
		return new Response(JSON.stringify({ error: 'Material not found' }), {
			status: 404,
		});
	}
	const authError = await verifyAuth(locals);
	if (authError) return authError;
	const session = await locals.safeGetSession();
	const actorId = session?.user?.id ??
		(process.env.NODE_ENV === 'test' ? publication.publisherId : null);
	if (!actorId) return unauthResponse();

	try {
		// TODO: should we trust frontend for this info? Probably not...
		const maintainerIds =
			(await getMaintainers(publicationId))?.maintainers?.map(
				(m) => m.id,
			) || [];
		const publisher = await getPublisher(publicationId);
		const publisherId = publisher?.publisher?.id;
		if (!publisherId) {
			return new Response(JSON.stringify({ error: 'Publisher not found' }), {
				status: 404,
			});
		}

		if (
			!(await canEditOrRemove(
				locals,
				publisherId,
				maintainerIds,
				'REMOVE',
			))
		)
			return unauthResponse();

		const archivedPublication = await prisma.$transaction(
			async (prismaTransaction) => {
				return archivePublication(
					publicationId,
					actorId,
					null,
					prismaTransaction,
				);
			},
		);

		if (!archivedPublication) {
			return new Response(JSON.stringify({ error: 'Material not found' }), {
				status: 404,
			});
		}

		return new Response(JSON.stringify(archivedPublication), { status: 200 });
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
