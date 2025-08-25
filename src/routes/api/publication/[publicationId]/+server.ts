import {
	coverPicFetcher,
	type FetchedFileItem,
	fileSystem,
	getPublicationById,
} from '$lib/database';
import { profilePicFetcher } from '$lib/database/file';
import { PublicationType } from '@prisma/client';

export async function GET({ params }) {
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
		const publication = await getPublicationById(publicationId);
		if (!publication) {
			return new Response(
				JSON.stringify({ error: 'Material Not Found' }),
				{
					status: 404,
				},
			);
		}

		publication.publisher = {
			...publication.publisher,
			// @ts-ignore
			profilePicData: (await profilePicFetcher(publication.publisher.profilePic))
				.data,
		};

		publication.comments = await Promise.all(publication.comments.map(async (comment) => {
			return {
				...comment,
				user: {
					...comment.user,
					profilePicData: (await profilePicFetcher(comment.user.profilePic))
						.data,
				},
				replies: await Promise.all(comment.replies.map(async (reply) => {
					return {
						...reply,
						user: {
							...reply.user,
							profilePicData: (await profilePicFetcher(
								reply.user.profilePic,
							)).data,
						},
					};
				})),
			};
		}));

		publication.maintainers = await Promise.all(publication.maintainers.map(async (user) => {
			return {
				...user,
				profilePicData: (await profilePicFetcher(user.profilePic)).data,
			};
		}));


		if (publication.materials) {

			// coverPic return
			const coverFileData: FetchedFileItem = await coverPicFetcher(
				publication.materials.encapsulatingType,
				publication.coverPic,
			);

			return new Response(
				JSON.stringify({
					isMaterial: true,
					publication: publication,
					//fileData,
					coverFileData,
				}),
				{
					status: 200,
				},
			);
		} else if (publication.circuit) {
			publication.circuit.nodes = await Promise.all(publication.circuit.nodes.map(
				async (node) => {
					let coverPicData: string | null;
					if (
						node.publication.type === PublicationType.Material &&
						node.publication.materials
					) {
						coverPicData = (await coverPicFetcher(
							node.publication.materials.encapsulatingType,
							node.publication.coverPic,
						)).data;
					} else {
						const filePath = node.publication.coverPic!.path;
						coverPicData = (await coverPicFetcher(
							null,
							node.publication.coverPic!,
						)).data;
						// const currentFileData = await fileSystem.readFile(filePath);
						// coverPicData = currentFileData.toString('base64');
					}
					return {
						...node,
						publication: {
							...node.publication,
							publisher: {
								...node.publication.publisher,
								profilePicData: (await profilePicFetcher(
									node.publication.publisher.profilePic,
								)).data,
							},
							coverPicData: coverPicData,
						},
					};
				},
			));
			return new Response(
				JSON.stringify({
					isMaterial: false,
					publication: publication,
					//fileData: [],
					coverFileData: {},
				}),
				{
					status: 200,
				},
			);
		}

		// file content for return
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}
