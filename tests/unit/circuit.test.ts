import { describe, it, expect, vi } from 'vitest';
import {
	createCircuitPublication,
	deleteCircuitByPublicationId,
	getAllCircuits,
	getCircuitByPublicationId,
	updateCircuitByPublicationId,
} from '$lib/database';

import { prisma } from '$lib/database';
import {
	getCircuitsContainingPublication,
	sortSwitch,
} from '$lib/database/circuit';
import { Difficulty } from '@prisma/client';

describe('get specific circuit', () => {
	it('should return a circuit by publicationId', async () => {
		prisma.circuit.findUnique = vi.fn().mockResolvedValue({
			id: 2,
			publicationId: 1,
		});

		const material = await getCircuitByPublicationId(1);
		expect(material).toMatchObject({ id: 2, publicationId: 1 });
	});
});

describe('delete specific circuit', () => {
	it('should delete a circuit by publicationId', async () => {
		prisma.publication.delete = vi.fn().mockResolvedValue({
			id: 2,
			publicationId: 1,
		});

		const material = await deleteCircuitByPublicationId(1);
		expect(material).toMatchObject({ id: 2, publicationId: 1 });
	});
});

describe('create specific circuit', () => {
	it('should create a circuit', async () => {
		prisma.circuit.create = vi.fn().mockResolvedValue({
			id: 2,
			publicationId: 1,
		});

		const material = await createCircuitPublication(
			'1',
			5,
			{
				title: 'Introduction to Quantum Physics',
				description:
					"A beginner's guide to understanding the basic concepts of quantum physics.",
				difficulty: Difficulty.easy,
				learningObjectives: [
					'Understand the fundamental principles of quantum mechanics',
					'Learn about wave-particle duality',
					'Familiarize with the concept of superposition',
					'Gain insights into quantum entanglement',
				],
				prerequisites: [
					'Basic knowledge of classical physics',
					'Familiarity with algebra and calculus',
				],
			},
			prisma,
		);
		expect(material).toMatchObject({ id: 2, publicationId: 1 });
	});
});

describe('update specific circuit', () => {
	it('update create a circuit by pubId', async () => {
		prisma.circuit.update = vi.fn().mockResolvedValue({
			id: 2,
			publicationId: 1,
		});

		const material = await updateCircuitByPublicationId(
			1,
			5,
			{
				title: 'Introduction to Quantum Physics',
				description:
					"A beginner's guide to understanding the basic concepts of quantum physics.",
				difficulty: Difficulty.easy,
				learningObjectives: [
					'Understand the fundamental principles of quantum mechanics',
					'Learn about wave-particle duality',
					'Familiarize with the concept of superposition',
					'Gain insights into quantum entanglement',
				],
				prerequisites: [
					'Basic knowledge of classical physics',
					'Familiarity with algebra and calculus',
				],
			},
			prisma,
		);
		expect(material).toMatchObject({ id: 2, publicationId: 1 });
	});
});

describe('get all circuits', () => {
	it('should return all circuits', async () => {
		prisma.circuit.findMany = vi.fn().mockResolvedValue([
			{ id: 3, publicationId: 1 },
			{ id: 4, publicationId: 2 },
		]);

		const circuits = await getAllCircuits([], [], 0, 'Most Recent', '');
		expect(circuits).toHaveLength(2);
		expect(circuits[0].publicationId).toBe(1);
		expect(circuits[1].publicationId).toBe(2);

		const circuits2 = await getAllCircuits(
			['t'],
			['1'],
			1,
			'Sort BY',
			'Ivan',
		);
		expect(circuits2).toHaveLength(0);
	});
	it('should get all circuits with the publication', async () => {
		prisma.circuit.findMany = vi.fn().mockResolvedValue([
			{ id: 3, publicationId: 1 },
			{ id: 4, publicationId: 2 },
		]);

		const circuitsCont = await getCircuitsContainingPublication(1);
		expect(circuitsCont).toHaveLength(2);
		expect(circuitsCont[0].publicationId).toBe(1);
		expect(circuitsCont[1].publicationId).toBe(2);
		expect(prisma.circuit.findMany).toHaveBeenCalled();
	});
});

describe('order of circuits', () => {
	it('should return the correct indicator for order', async () => {
		expect(sortSwitch('Most Liked')).toEqual({
			publication: { likes: 'desc' },
		});
		expect(sortSwitch('Most Used')).toEqual({
			publication: { usageCount: 'desc' },
		});
		expect(sortSwitch('Oldest')).toEqual({
			publication: { createdAt: 'asc' },
		});
		expect(sortSwitch('Most Recent')).toEqual({
			publication: { createdAt: 'desc' },
		}); // Default case
		expect(sortSwitch('')).toEqual({ publication: { createdAt: 'desc' } }); // Default case
	});
});
