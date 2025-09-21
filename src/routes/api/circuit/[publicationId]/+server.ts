import {
	addNode,
	type CircuitForm, coverPicFetcher,
	deleteCircuitByPublicationId,
	deleteNode,
	editNode,
	fileSystem,
	getCircuitByPublicationId,
	getPublisherId,
	handleConnections,
	handleEdges,
	type NodeDiffActions,
	prisma,
	updateCircuitByPublicationId,
	updateCoverPic
} from '$lib/database';
import { Prisma } from '@prisma/client';
import { canEditOrRemove, unauthResponse, verifyAuth } from '$lib/database/auth';

import type {File as PrismaFile} from '@prisma/client';
import {enqueueCircuitComparison} from "$lib/PiscinaUtils/runner";
import { getMaintainers, getPublisher } from '$lib/database/publication';


export async function GET({ params, locals }) {
	try {
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

		const circuit = await getCircuitByPublicationId(publicationId);

		if (!circuit) {
			return new Response(
				JSON.stringify({ error: 'Circuit Not Found' }),
				{
					status: 404,
				},
			);
		}


		const circuitInfo = {
			...circuit,
			coverPicData: await coverPicFetcher(
				null,
				circuit.publication.coverPic
			)
		};

		return new Response(JSON.stringify(circuitInfo), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}

/**
 * Update circuit
 * @param request
 * @param params
 * @param locals
 */
export async function PUT({ request, params, locals }) {
	// Authentication step
	// return 401 if user not authenticated
	const body: CircuitForm & {
		circuitId: number,
		publisherId: string
	} = await request.json();

	const authError = await verifyAuth(locals, body.userId);
	if (authError) return authError;

	const metaData = body.metaData;
	// const userId = circuit.userId;
	const publisherId = body.publisherId;
	const nodeInfo: NodeDiffActions = body.nodeDiff;
	const tags = metaData.tags;
	const maintainers = metaData.maintainers;
	const coverPic = body.coverPic;

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
		const maintainerIds = (await getMaintainers(publicationId))?.maintainers?.map(m => m.id) || [];
		const publisher = await getPublisher(publicationId);
		const publisherId = publisher?.publisher?.id;

		if (!(await canEditOrRemove(locals, publisherId, maintainerIds, "EDIT")))
			return unauthResponse();

		const circuit = await prisma.$transaction(async (prismaTransaction) => {
			await handleConnections(
				tags,
				maintainers,
				publicationId,
				prismaTransaction,
			);

			// if coverPic detected, change
			if (coverPic) {
				await updateCoverPic(
					coverPic,
					publicationId,
					body.userId,
					false,
					prismaTransaction,
				);
			}

			// delete nodes
			for (const node of nodeInfo.delete) {
				await deleteNode(
					body.circuitId,
					node.publicationId,
					prismaTransaction,
				);
			}

			// add nodes
			for (const node of nodeInfo.add) {
				await addNode(
					body.circuitId,
					node.publicationId,
					node.x,
					node.y,
					prismaTransaction,
				);
			}

			// edit existing nodes (currently editing positions only)
			for (const node of nodeInfo.edit) {
				await editNode(
					body.circuitId,
					node.publicationId,
					node.x,
					node.y,
					prismaTransaction,
				);
			}

			await handleEdges(body.circuitId, nodeInfo.next, prismaTransaction);

			return await updateCircuitByPublicationId(
				publicationId,
				nodeInfo.numNodes,
				metaData,
				prismaTransaction,
			);
		});

		const id = circuit.id;

		enqueueCircuitComparison(publicationId).catch(error => console.error(error))

		return new Response(JSON.stringify({ id }), { status: 200 });
	} catch (error) {
		console.error(error);
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === 'P2025'
		) {
			return new Response(
				JSON.stringify({ error: 'Circuit not found' }),
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

export async function DELETE({ params, locals }) {
	const publicationId = parseInt(params.publicationId);
	if (isNaN(publicationId) || publicationId <= 0) {
		return new Response(
			JSON.stringify({
				error: 'Bad Delete Request - Invalid Circuit publicationId',
			}),
			{ status: 400 },
		);
	}

	const publication = await getPublisherId(publicationId);
	const authError = await verifyAuth(locals, publication.publisherId);
	if (authError) return authError;

	try {
		// TODO: should we trust frontend for this info? Probably not...
		const maintainerIds = (await getMaintainers(publicationId))?.maintainers?.map(m => m.id) || [];
		const publisher = await getPublisher(publicationId);
		const publisherId = publisher?.publisher?.id;

		if (!(await canEditOrRemove(locals, publisherId, maintainerIds, "REMOVE")))
			return unauthResponse();

		const circuit = await prisma.$transaction(async (prismaTransaction) => {
			const publication = await deleteCircuitByPublicationId(
				publicationId,
				prismaTransaction,
			);

			const coverPic: PrismaFile = publication.coverPic;

			// if there is a coverPic, delete
			if (coverPic) {
				fileSystem.deleteFile(coverPic.path);
			}

			return publication.circuit;
		});

		return new Response(JSON.stringify(circuit), { status: 200 });
	} catch (error) {
		console.error(error);
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === 'P2025'
		) {
			return new Response(
				JSON.stringify({ error: 'Circuit not found' }),
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
