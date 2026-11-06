import { describe, expect, it, beforeEach} from 'vitest';
import { resetCircuitTable, resetMaterialTable, apiTestingUrl } from '../setup';
// import { Difficulty } from '@prisma/client';
import {
	addNode,
	getMaterialByPublicationId,
	prisma,
} from '$lib/database';
import { createUniqueUser } from '../../utility/users';
import { createUniqueCircuit, createUniqueMaterial } from '../../utility/publicationsUtility';

async function populate() {
	const user = await createUniqueUser()
	return createUniqueCircuit(user.id);
}

describe('Circuits', async () => {
	describe('[GET] /circuit/:id', () => {
		it('should respond with 400 if the id is < 0', async () => {
			const response = await fetch(`${apiTestingUrl}/circuit/-1`, {
				method: 'GET',
			});
			expect(response.status).toBe(400);
			const body = await response.json();
			expect(body.error).toEqual('Bad Request - Invalid ID');
			expect(body).not.toHaveProperty('id');
		});

		it('should respond with 400 if the id is = 0', async () => {
			const response = await fetch(`${apiTestingUrl}/circuit/0`, {
				method: 'GET',
			});
			expect(response.status).toBe(400);
			const body = await response.json();
			expect(body.error).toEqual('Bad Request - Invalid ID');
			expect(body).not.toHaveProperty('id');
		});

		it('should respond with 400 if the id is malformed', async () => {
			const response = await fetch(`${apiTestingUrl}/circuit/yoan`, {
				method: 'GET',
			});
			expect(response.status).toBe(400);
			const body = await response.json();
			expect(body.error).toEqual('Bad Request - Invalid ID');
			expect(body).not.toHaveProperty('id');
		});

		it('should respond with 404 if the publication of type circuit does not exist', async () => {
			const response = await fetch(`${apiTestingUrl}/circuit/9437985`, {
				method: 'GET',
			});
			expect(response.status).toBe(404);
			const body = await response.json();
			expect(body.error).toBe('Circuit Not Found');
			expect(body).not.toHaveProperty('firstName');
		});

		it('should support circuits without a custom cover picture', async () => {
			const user = await createUniqueUser();
			const circuit = await createUniqueCircuit(user.id)

			const response = await fetch(
				`${apiTestingUrl}/circuit/${circuit.publicationId}`,
				{ method: 'GET' },
			);
			expect(response.status).toBe(200);

			await resetCircuitTable();
		});

		it('should respond with 200 if the publication of type circuit exists', async () => {
			const circuit = await populate();

			const response = await fetch(
				`${apiTestingUrl}/circuit/${circuit.publicationId}`,
				{ method: 'GET' },
			);

			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody).toHaveProperty('publication.publisherId');
			expect(responseBody.publicationId).toBe(responseBody.publication.id);

			await resetCircuitTable();
		});
	});

	describe('[GET] /circuit', () => {
		beforeEach(async () => {
			await resetCircuitTable();
		});

		it('should handle zero circuits', async () => {
			const response = await fetch(`${apiTestingUrl}/circuit`, { method: 'GET' });
			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.circuits).toHaveLength(0);
			expect(responseBody.idsCirc).toHaveLength(0)
		});

		it('should handle one circuit', async () => {
			await populate();

			const response = await fetch(`${apiTestingUrl}/circuit`, { method: 'GET' });
			expect(response.status).toBe(200);

			const responseBody = await response.json();
			expect(responseBody.circuits[0]).toHaveProperty('publication.publisherId');
			expect(responseBody.circuits[0].publicationId).toBe(
				responseBody.circuits[0].publication.id,
			);
			expect(responseBody.circuits).toHaveLength(1);

			await resetCircuitTable();
		});

		it('should handle two or more (random number) circuits', async () => {
			const randomNumber = Math.round(Math.random() * 8) + 2;
			for (let i = 0; i < randomNumber; i++) {
				await populate();
			}

			const response = await fetch(`${apiTestingUrl}/circuit`, { method: 'GET' });
			expect(response.status).toBe(200);

			const responseBody = await response.json();

			expect(responseBody.circuits.length).toBeGreaterThanOrEqual(randomNumber);

			await resetCircuitTable();
		});
	});

	describe('[DELETE] /circuit/:id', () => {
		it('should respond with 400 if the id is < 0', async () => {
			const response = await fetch(`${apiTestingUrl}/circuit/-1`, {
				method: 'DELETE',
			});
			expect(response.status).toBe(400);
			const body = await response.json();
			expect(body.error).toEqual('Bad Delete Request - Invalid Circuit publicationId');
			expect(body).not.toHaveProperty('id');
		});

		it('should respond with 200 if successful deletion of everything related to circuit', async () => {
			const circuit = await populate();
			const user = await createUniqueUser();
			const material = await createUniqueMaterial(user.id);
			const node = await addNode(circuit.id, material.publicationId, 0, 0);
			expect(node).not.toBeNull();

			const response = await fetch(
				`${apiTestingUrl}/circuit/${circuit.publicationId}`,
				{
					method: 'DELETE',
				},
			);
			expect(response.status).toBe(200);

			const materialAfter = await getMaterialByPublicationId(material.publicationId);
			expect(materialAfter).toBeTruthy();

			const nodeAfter = await prisma.node.findUnique({
				where: {
					circuitId_publicationId: {
						circuitId: circuit.id,
						publicationId: material.publicationId,
					}
				}
			});
			expect(nodeAfter).toBeNull();

			await resetCircuitTable();
			await resetMaterialTable();
		});
	});
});
