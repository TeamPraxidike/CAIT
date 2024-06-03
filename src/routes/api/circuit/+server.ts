import { getAllCircuits } from '$lib/database/circuit';
import {
	addNode,
	type CircuitForm,
	createCircuitPublication,
	fileSystem,
	handleConnections,
	handleEdges,
	type NodeDiffActions,
	prisma,
	updateCircuitCoverPic,
} from '$lib/database';
import { verifyAuth } from '$lib/database/auth';

export async function GET({ locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	try {
		let circuits = await getAllCircuits();

		circuits = circuits.map((circuit) => {
			const filePath = circuit.publication.coverPic!.path;

			const currentFileData = fileSystem.readFile(filePath);

			return {
				...circuit,
				coverPicData: currentFileData.toString('base64'),
			};
		});
		return new Response(JSON.stringify(circuits), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}

/**
 * Create publication of type circuit
 * @param request
 * @param params
 */
export async function POST({ request, locals }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	const body: CircuitForm = await request.json();
	const tags = body.metaData.tags;
	const maintainers = body.metaData.maintainers;
	const metaData = body.metaData;
	const userId = body.userId;
	const nodeInfo: NodeDiffActions = body.nodeDiff;
	const coverPic = body.coverPic;

	try {
		const createdCircuit = await prisma.$transaction(
			async (prismaTransaction) => {
				const circuit = await createCircuitPublication(
					userId,
					metaData,
					prismaTransaction,
				);
				console.log('AAAAAAAAAAAAAAAAA');

				await handleConnections(
					tags,
					maintainers,
					circuit.publicationId,
					prismaTransaction,
				);

				console.log('bBBBBBBBBBBBBBBBBBBBB');

				// if no cover pic detected in post, throw error
				if (coverPic) {
					await updateCircuitCoverPic(
						coverPic,
						circuit.publicationId,
						prismaTransaction,
					);
				} else {
					throw new Error(
						'Circuit POST request needs a cover picture',
					);
				}

				console.log('CCCCCCCCCCCCCCCCCCCCCCCCC');

				// add nodes
				for (const node of nodeInfo.add) {
					await addNode(
						circuit.id,
						node.publicationId,
						node.x,
						node.y,
						prismaTransaction,
					);
				}
				console.log('DDDDDDDDDDDDDDDDDDDDD');

				await handleEdges(circuit.id, nodeInfo.next, prismaTransaction);
				console.log('eeeeeeeeeeeeeeeeeeeeeeee');

				return circuit;
			},
		);

		const id = createdCircuit.publicationId;

		return new Response(JSON.stringify({ id }), { status: 200 });
	} catch (error) {
		if (
			error instanceof Error &&
			error.message === 'Circuit POST request needs a cover picture'
		) {
			return new Response(
				JSON.stringify({
					error: 'Bad request - Circuit POST request needs a cover picture',
				}),
				{
					status: 400,
				},
			);
		}
		return new Response(JSON.stringify({ error: 'Server Error' }), {
			status: 500,
		});
	}
}
