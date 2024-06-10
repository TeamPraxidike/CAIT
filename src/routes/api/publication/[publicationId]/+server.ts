import {
	coverPicFetcher,
	type FetchedFileArray,
	type FetchedFileItem,
	fileSystem,
	getPublicationById,
} from '$lib/database';
import { profilePicFetcher } from '$lib/database/file';

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
			profilePicData: profilePicFetcher(publication.publisher.profilePic)
				.data,
		};

		publication.comments = publication.comments.map((comment) => {
			return {
				...comment,
				user: {
					...comment.user,
					profilePicData: profilePicFetcher(comment.user.profilePic)
						.data,
				},
				replies: comment.replies.map((reply) => {
					return {
						...reply,
						user: {
							...reply.user,
							profilePicData: profilePicFetcher(
								reply.user.profilePic,
							).data,
						},
					};
				}),
			};
		});

		publication.maintainers = publication.maintainers.map((user) => {
			return {
				...user,
				profilePicData: profilePicFetcher(user.profilePic).data,
			};
		});

		if (publication.materials) {
			const fileData: FetchedFileArray = [];

			for (const file of publication.materials.files) {
				const currentFileData = fileSystem.readFile(file.path);
				fileData.push({
					fileId: file.path,
					data: currentFileData.toString('base64'),
				});
			}

			// coverPic return
			const coverFileData: FetchedFileItem = coverPicFetcher(
				publication.materials.encapsulatingType,
				publication.coverPic,
			);

			return new Response(
				JSON.stringify({
					isMaterial: true,
					publication: publication,
					fileData,
					coverFileData,
				}),
				{
					status: 200,
				},
			);
		} else if (publication.circuit) {
			publication.circuit.nodes = publication.circuit.nodes.map(
				(node) => {
					return {
						...node,
						publication: {
							...node.publication,
							publisher: {
								...node.publication.publisher,
								profilePicData: profilePicFetcher(
									node.publication.publisher.profilePic,
								).data,
							},
						},
					};
				},
			);
			return new Response(
				JSON.stringify({
					isMaterial: false,
					publication: publication,
					fileData: [],
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
