import {getMaterialByPublicationId, updateMaterialByPublicationId,
updateMaterialConnectMaintainers, updateMaterialDisconnectMaintainers,
updateMaterialConnectTags, updateMaterialDisconnectTags} from "$lib/database/material";
import {prisma} from "$lib/database";
import {Prisma} from "@prisma/client/extension";


async function connectMaintainers(publicationId: number, maintainerConnect: string[],
								  prismaContext: Prisma.TransactionClient = prisma): Promise<void> {
	// ids of users to connect as maintainers
	const maintainerConParsed = maintainerConnect.map((number: string) => {
		const parsed = parseInt(number);
		if (isNaN(parsed)) {
			throw new Error(`Invalid number in maintainer connect: ${number}`);
		}
		return parsed;
	});

	await updateMaterialConnectMaintainers(publicationId, maintainerConParsed, prismaContext);
}

async function disconnectMaintainers(publicationId: number, maintainerDisconnect: string[],
									 prismaContext: Prisma.TransactionClient = prisma): Promise<void> {
// ids of users to disconnect as maintainers
	const maintainerDisParsed = maintainerDisconnect.map((number: string) => {
		const parsed = parseInt(number);
		if (isNaN(parsed)) {
			throw new Error(`Invalid number in maintainer disconnect: ${number}`);
		}
		return parsed;
	});

	await updateMaterialDisconnectMaintainers(publicationId, maintainerDisParsed, prismaContext);
}

async function connectTags(publicationId: number, tagConnect: string[],
						   prismaContext: Prisma.TransactionClient = prisma): Promise<void> {
// ids of tags to connect
	const tagConnectParsed = tagConnect.map((number: string) => {
		const parsed = parseInt(number);
		if (isNaN(parsed)) {
			throw new Error(`Invalid number in tag connect: ${number}`);
		}
		return parsed;
	});

	await updateMaterialConnectTags(publicationId, tagConnectParsed, prismaContext);
}

async function disconnectTags(publicationId: number, tagDisconnect: string[],
							  prismaContext: Prisma.TransactionClient = prisma): Promise<void> {
// ids of tags to disconnect
	const tagDisconnectParsed = tagDisconnect.map((number: string) => {
		const parsed = parseInt(number, 10);
		if (isNaN(parsed)) {
			throw new Error(`Invalid number in tag disconnect: ${number}`);
		}
		return parsed;
	});

	await updateMaterialDisconnectTags(publicationId, tagDisconnectParsed, prismaContext);
}

/**
 * Get material by id
 * @param params
 * @constructor
 */

export async function GET({ params }) {
    // Authentication step
    // return 401 if user not authenticated

    const publicationId = parseInt(params.publicationId);

	if (isNaN(publicationId) || publicationId <= 0) {
		return new Response(JSON.stringify({ error: 'Bad Request - Invalid ID' }), {
			status: 400,
		});
	}

	try {
		const material = await getMaterialByPublicationId(publicationId);
		if (!material) {
			return new Response(JSON.stringify({ error: 'Material Not Found' }), {
				status: 404,
			});
		}
		return new Response(JSON.stringify(material), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}

/**
 * Update material
 * @param request
 * @param params
 */
export async function POST({ request, params }) {
	// Authentication step
	// return 401 if user not authenticated

	const publicationId = parseInt(params.publicationId);

	if (isNaN(publicationId) || publicationId <= 0) {
		return new Response(JSON.stringify({ error: 'Bad Request - Invalid ID' }), {
			status: 400,
		});
	}

	const body = await request.json();

	try {
		const material = await prisma.$transaction(async (prismaTransaction) => {
			if (body.maintainerConnect.length > 0) {
				await connectMaintainers(publicationId, body.maintainerConnect, prismaTransaction);
			}
			if (body.maintainerDisconnect.length > 0) {
				await disconnectMaintainers(publicationId, body.maintainerDisconnect, prismaTransaction);
			}
			if (body.tagConnect.length > 0) {
				await connectTags(publicationId, body.tagConnect, prismaTransaction);
			}
			if (body.tagDisconnect.length > 0) {
				await disconnectTags(publicationId, body.tagDisconnect, prismaTransaction);
			}

			const material = await updateMaterialByPublicationId(
				publicationId,
				body.title,
				body.description,
				body.difficulty,
				body.learningObjectives,
				body.prerequisites,
				body.coverPic,
				body.copyright,
				body.timeEstimate,
				body.theoryPractice,
				prismaTransaction
			);
			if (!material) {
				return new Response(JSON.stringify({error: 'Material Not Found'}), {
					status: 404,
				});
			}
		});

		return new Response(JSON.stringify({ material }), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}
