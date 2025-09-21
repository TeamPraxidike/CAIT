import { type CircuitWithPublication, getAllCircuits } from '$lib/database/circuit';
import {
	addNode,
	type CircuitForm, coverPicFetcher,
	createCircuitPublication,
	handleConnections,
	handleEdges,
	type NodeDiffActions,
	prisma,
	updateCoverPic,
	updateReputation
} from '$lib/database';
import { verifyAuth } from '$lib/database/auth';

import {
	enqueueCircuitComparison,
} from '$lib/PiscinaUtils/runner';

import { profilePicFetcher } from '$lib/database/file';
import { validateMetadata } from '$lib/util/validatePublication';

export async function GET({ url }) {
	try {
		const t = url.searchParams.get('tags');
		const tags = t ? t.split(',') : [];

		const p = url.searchParams.get('publishers');
		const publishers = p ? p.split(',') : [];
		const limit = Number(url.searchParams.get('limit')) || 0;
		const sort = url.searchParams.get('sort') || 'Most Recent';
		const query: string = url.searchParams.get('q') || '';
		const amount: number = Number(url.searchParams.get('amount')) || 9;

		let circuits = await getAllCircuits(
			tags,
			publishers,
			limit,
			sort,
			query,
		);

		// circuits = circuits.filter((c: CircuitWithPublisher) => !c.publication.isDraft);
		const idsCirc = circuits.map(c => c.publicationId)
		circuits = circuits.slice(0, amount)

		circuits = await Promise.all(circuits.map(async circuit => {
			// const filePath = circuit.publication.coverPic!.path;
			//
			// const currentFileData = await fileSystem.readFile(filePath);

			return {
				...circuit,
				publisher: {
					...circuit.publication.publisher,
					profilePicData: (await profilePicFetcher(
						circuit.publication.publisher.profilePic,
					)).data,
				},
				coverPicData: (await coverPicFetcher(
					circuit.publication.coverPic
				)).data,
			};
		}));
		return new Response(
			JSON.stringify({
				// circuits: circuits.slice(0, amount),
				circuits: circuits,
				//idsCirc: circuits.map(c => c.publicationId),
				idsCirc: idsCirc
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
	const body: CircuitForm = await request.json();

	const authError = await verifyAuth(locals, body.userId);
	if (authError) return authError;

	const tags = body.metaData.tags;
	const maintainers = body.metaData.maintainers;
	const metaData = body.metaData;
	const userId = body.userId;
	const nodeInfo: NodeDiffActions = body.nodeDiff;
	const coverPic = body.coverPic;
	const numNodes = body.nodeDiff.numNodes;

	if (!validateMetadata(metaData)) {
		metaData.isDraft = true;
	}

	try {
		const createdCircuit: CircuitWithPublication = await prisma.$transaction(
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
					await updateCoverPic(
						coverPic,
						circuit.publicationId,
						userId,
						false,
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
		await updateReputation(userId, 3);

		const id = createdCircuit.publicationId;

		enqueueCircuitComparison(id).catch((error) => console.error(error));

		return new Response(JSON.stringify({ id }), { status: 200 });
	} catch (error) {
		console.error('Error creating circuit publication:', error);
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
