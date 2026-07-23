import { describe, expect, it } from 'vitest';
import {
	addNode,
	archivePublication,
	getCircuitByPublicationId,
	handleEdges,
	prisma,
	restorePublication,
} from '$lib/database';
import { createUniqueCircuit, createUniqueMaterial } from '../../utility/publicationsUtility';
import { createUniqueUser } from '../../utility/users';

describe('Publication archive lifecycle', () => {
	it('preserves a circuit graph while hiding and restoring an archived node', async () => {
		const user = await createUniqueUser();
		const circuit = await createUniqueCircuit(user.id, 2);
		const firstMaterial = await createUniqueMaterial(user.id);
		const secondMaterial = await createUniqueMaterial(user.id);

		await addNode(circuit.id, firstMaterial.publicationId, 0, 0);
		await addNode(circuit.id, secondMaterial.publicationId, 100, 0);
		await handleEdges(circuit.id, [
			{ fromId: firstMaterial.publicationId, toId: [secondMaterial.publicationId] },
		]);

		await archivePublication(firstMaterial.publicationId, user.id, 'integration test');

		const rawCircuitAfterArchive = await prisma.circuit.findUniqueOrThrow({
			where: { id: circuit.id },
			include: { nodes: true },
		});
		const rawEdgeAfterArchive = await prisma.edge.findUnique({
			where: {
				circuitId_fromPublicationId_toPublicationId: {
					circuitId: circuit.id,
					fromPublicationId: firstMaterial.publicationId,
					toPublicationId: secondMaterial.publicationId,
				},
			},
		});
		const visibleCircuitAfterArchive = await getCircuitByPublicationId(circuit.publicationId);

		expect(rawCircuitAfterArchive.numNodes).toBe(1);
		expect(rawCircuitAfterArchive.nodes).toHaveLength(2);
		expect(rawEdgeAfterArchive).not.toBeNull();
		expect(visibleCircuitAfterArchive?.nodes.map((node) => node.publicationId))
			.toEqual([secondMaterial.publicationId]);
		expect(visibleCircuitAfterArchive?.nodes[0].prerequisites).toHaveLength(0);

		await restorePublication(firstMaterial.publicationId, user.id, 'integration test restore');

		const rawCircuitAfterRestore = await prisma.circuit.findUniqueOrThrow({
			where: { id: circuit.id },
		});
		const visibleCircuitAfterRestore = await getCircuitByPublicationId(circuit.publicationId);

		expect(rawCircuitAfterRestore.numNodes).toBe(2);
		expect(visibleCircuitAfterRestore?.nodes).toHaveLength(2);
		expect(
			visibleCircuitAfterRestore?.nodes
				.find((node) => node.publicationId === firstMaterial.publicationId)
				?.next,
		).toHaveLength(1);
	});
});
