import { prisma } from '$lib/database/prisma';
import type { RequestHandler } from './$types';
import { profilePicFetcher } from '$lib/database/file';
import { canViewPublication } from '$lib/server/draftShare';

export const GET: RequestHandler = async ({ params, locals, url }) => {
	const publicationId = parseInt(params.publicationId);

	if (isNaN(publicationId) || publicationId <= 0) {
		return new Response('Invalid publication ID', { status: 400 });
	}

	try {
		const mayView = await canViewPublication(
			publicationId,
			locals.user?.id,
			url.searchParams.get('draftToken'),
		);
		if (!mayView) {
			return new Response('Publication not found', { status: 404 });
		}

		const history = await prisma.publicationHistory.findMany({
			where: {
				publicationId: publicationId
			},
			orderBy: {
				createdAt: 'desc'
			},
			include: {
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						username: true,
						profilePic: {
							select: {
								path: true,
								type: true
							}
						}
					}
				}
			}
		});

		// Fetch profile pictures
		const historyWithProfilePics = await Promise.all(history.map(async (entry) => {
			let profilePicData = null;
			if (entry.user && entry.user.profilePic) {
				const fetchedPic = await profilePicFetcher(entry.user.profilePic);
				profilePicData = fetchedPic.data;
			}
			return {
				...entry,
				user: entry.user ? {
					...entry.user,
					profilePicData
				} : null
			};
		}));

		return new Response(JSON.stringify(historyWithProfilePics), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('Error fetching publication history:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
};
