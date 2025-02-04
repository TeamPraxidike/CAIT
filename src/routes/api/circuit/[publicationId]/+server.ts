import {
	addNode,
	type CircuitForm,
	deleteCircuitByPublicationId,
	deleteNode,
	editNode,
	fileSystem,
	getCircuitByPublicationId,
	handleConnections,
	handleEdges,
	type NodeDiffActions,
	prisma,
	updateCircuitByPublicationId,
	updateCircuitCoverPic,
} from '$lib/database';
import { Prisma } from '@prisma/client';
import { verifyAuth } from '$lib/database/auth';

import type {File as PrismaFile} from '@prisma/client';
import {enqueueCircuitComparison} from "$lib/PiscinaUtils/runner";


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

		const filePath = circuit.publication.coverPic!.path;

		const currentFileData = await fileSystem.readFile(filePath);

		const circuitInfo = {
			...circuit,
			coverPicData: currentFileData.toString('base64'),
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

	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const body: CircuitForm & {
		circuitId: number;
	} = await request.json();

	if ((await locals.safeGetSession()).user!.id !== body.userId) {
		return new Response(
			JSON.stringify({
				error: 'Bad Request - User IDs not matching',
			}),
			{ status: 401 },
		);
	}

	const metaData = body.metaData;
	// const userId = circuit.userId;
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
		const circuit = await prisma.$transaction(async (prismaTransaction) => {
			await handleConnections(
				tags,
				maintainers,
				publicationId,
				prismaTransaction,
			);

			// if coverPic detected, change
			if (coverPic) {
				await updateCircuitCoverPic(
					coverPic,
					publicationId,
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

		enqueueCircuitComparison(id).catch(error => console.error(error))

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

export async function DELETE({ params }) {
	const id = parseInt(params.publicationId);
	if (isNaN(id) || id <= 0) {
		return new Response(
			JSON.stringify({
				error: 'Bad Delete Request - Invalid Circuit Id',
			}),
			{ status: 400 },
		);
	}
	try {
		const circuit = await prisma.$transaction(async (prismaTransaction) => {
			const publication = await deleteCircuitByPublicationId(
				id,
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
