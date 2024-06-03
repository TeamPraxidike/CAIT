import {
	addNode,
	type CircuitForm,
	deleteCircuitByPublicationId,
	deleteNode, editNode, fileSystem,
	getCircuitByPublicationId,
	handleConnections,
	handleEdges,
	type NodeDiffActions,
	prisma,
	updateCircuitByPublicationId, updateCircuitCoverPic,
} from '$lib/database';
import { Prisma } from '@prisma/client';
import { verifyAuth } from '$lib/database/auth';
import type {File as PrismaFile} from '@prisma/client';

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

		const currentFileData = fileSystem.readFile(filePath);

		const circuitInfo = {
			...circuit,
			coverPicData: currentFileData.toString('base64'),
		}

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
 */
export async function PUT({ request, params }) {
	// Authentication step
	// return 401 if user not authenticated

	const body: CircuitForm & {
		circuitId: number;
	} = await request.json();
	const circuit: CircuitForm = body;
	const metaData = circuit.metaData;
	// const userId = circuit.userId;
	const nodeInfo: NodeDiffActions = circuit.nodeDiff;
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
				body.circuitId,
				prismaTransaction,
			);

			// if coverPic detected, change
			if (coverPic){
				await updateCircuitCoverPic(
					coverPic,
					circuit.publicationId,
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

			// delete nodes
			for (const node of nodeInfo.delete) {
				await deleteNode(
					body.circuitId,
					node.publicationId,
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
				metaData,
				prismaTransaction,
			);
		});

		const id = circuit.id;

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
