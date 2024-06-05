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
import { mapToDifficulty, mapToType } from '$lib';

export async function GET({ locals, url }) {
	const authError = await verifyAuth(locals);
	if (authError) return authError;

	try {
		const t = url.searchParams.get('tags');
		const tags = t ? t.split(',') : [];

		const p = url.searchParams.get('publishers');
		const publishers = p ? p.split(',') : [];
		// const publishers = p ? p.split(',').map((x) => parseInt(x)) : [];
		const limit = Number(url.searchParams.get('limit')) || 0;
		const sort = url.searchParams.get('sort') || 'Most Recent';
		const query: string = url.searchParams.get('q') || '';

		console.log('Yassss: ' + url.searchParams.get('limit'));
		console.log(limit);
		let circuits = await getAllCircuits(
			tags,
			publishers,
			limit,
			sort,
			query,
		);

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
	console.log('BODY: ' + body);
	const tags = body.metaData.tags;
	const maintainers = body.metaData.maintainers;
	const metaData = body.metaData;
	const userId = body.userId;
	const nodeInfo: NodeDiffActions = body.nodeDiff;
	const coverPic = body.coverPic;
	const numNodes = body.nodeDiff.numNodes;

	try {
		const createdCircuit = await prisma.$transaction(
			async (prismaTransaction) => {
				const circuit = await createCircuitPublication(
					userId,
					numNodes,
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
