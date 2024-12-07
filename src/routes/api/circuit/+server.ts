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
	updateReputation,
} from '$lib/database';
import { verifyAuth } from '$lib/database/auth';

import {
	enqueueCircuitComparison,
} from '$lib/PiscinaUtils/runner';

import { profilePicFetcher } from '$lib/database/file';

export async function GET({ url }) {
	try {
		const t = url.searchParams.get('tags');
		const tags = t ? t.split(',') : [];

		const p = url.searchParams.get('publishers');
		const publishers = p ? p.split(',') : [];
		const limit = Number(url.searchParams.get('limit')) || 0;
		const sort = url.searchParams.get('sort') || 'Most Recent';
		const query: string = url.searchParams.get('q') || '';
		const amount: number = Number(url.searchParams.get('amount')) || 8;

		let circuits = await getAllCircuits(
			tags,
			publishers,
			limit,
			sort,
			query,
		);

		circuits = circuits.map(async circuit => {
			const filePath = circuit.publication.coverPic!.path;

			const currentFileData = await fileSystem.readFile(filePath);

			return {
				...circuit,
				publisher: {
					...circuit.publication.publisher,
					profilePicData: (await profilePicFetcher(
						circuit.publication.publisher.profilePic,
					)).data,
				},
				coverPicData: currentFileData.toString('base64'),
			};
		});
		return new Response(
			JSON.stringify({
				circuits: circuits.slice(0, amount),
				idsCirc: circuits.map(c => c.publicationId),
			}),
			{ status: 200 },
		);
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
	const numNodes = body.nodeDiff.numNodes;

	try {
		const createdCircuit = await prisma.$transaction(
			async (prismaTransaction: any) => {
				const circuit = await createCircuitPublication(
					userId,
					numNodes,
					metaData,
					prismaTransaction,
				);

				await handleConnections(
					tags,
					maintainers,
					circuit.publicationId,
					prismaTransaction,
				);

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

				await handleEdges(circuit.id, nodeInfo.next, prismaTransaction);

				return circuit;
			},
		);
		await updateReputation(userId, 50);

		const id = createdCircuit.publicationId;

		enqueueCircuitComparison(id).catch((error) => console.error(error));

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
