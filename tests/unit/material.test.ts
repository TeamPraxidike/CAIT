import { describe, it, expect, vi } from 'vitest';
import {
	createMaterialPublication,
	deleteMaterialByPublicationId,
	getAllMaterials,
	getMaterialByPublicationId,
	updateMaterialByPublicationId,
} from '$lib/database/material';

import { prisma } from '$lib/database';
import { sortSwitch } from '$lib/database/material';
import { Difficulty, MaterialType } from '@prisma/client';

describe('get specific material', () => {
	it('should return a material by publicationId', async () => {
		prisma.material.findUnique = vi.fn().mockResolvedValue({
			id: 2,
			coverPic: 'cover1.jpg',
			publicationId: 1,
		});

		const material = await getMaterialByPublicationId(1);
		expect(material).toMatchObject({
			id: 2,
			coverPic: 'cover1.jpg',
			publicationId: 1,
		});
	});
});

describe('get all materials', () => {
	it('should return all materials', async () => {
		prisma.material.findMany = vi.fn().mockResolvedValue([
			{ id: 3, coverPic: 'cover1.jpg', publicationId: 1 },
			{ id: 4, coverPic: 'cover2.jpg', publicationId: 2 },
		]);

		const materials = await getAllMaterials([], [], [], [], '', '');
		expect(materials).toHaveLength(2);
		expect(materials[0].publicationId).toBe(1);
		expect(materials[1].publicationId).toBe(2);

		const materials1 = await getAllMaterials(
			['ivan'],
			['ivan'],
			[Difficulty.easy],
			[MaterialType.examQuestions],
			'oldest',
			'Ivan',
		);
		expect(materials1).toHaveLength(0);

		const materials2 = await getAllMaterials(
			['ivan'],
			['ivan'],
			[Difficulty.easy],
			[MaterialType.examQuestions],
			'Sort By',
			'Sort By',
		);
		expect(materials2).toHaveLength(0);
	});
});

describe('order of materials', () => {
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

describe('delete materials', () => {
	it('should return all deleted materials', async () => {
		prisma.publication.delete = vi.fn().mockResolvedValue({
			id: 3,
			coverPic: 'cover1.jpg',
			publicationId: 1,
		});

		const material = await deleteMaterialByPublicationId(1);
		expect(material).toMatchObject({
			id: 3,
			coverPic: 'cover1.jpg',
			publicationId: 1,
		});
		expect(prisma.publication.delete).toHaveBeenCalled();
	});
});

describe('create materials', () => {
	it('should create new material', async () => {
		prisma.material.create = vi.fn().mockResolvedValue({
			id: 3,
			coverPic: 'cover1.jpg',
			publicationId: 1,
		});

		const material = await createMaterialPublication('11', {
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
			materialType: MaterialType.other,
			copyright: '© 2024 Quantum Learning Inc.',
			timeEstimate: 120, // time in minutes
			theoryPractice: 70,
		});
		expect(material).toMatchObject({
			id: 3,
			coverPic: 'cover1.jpg',
			publicationId: 1,
		});
		expect(prisma.material.create).toHaveBeenCalled();
	});
});

describe('update materials', () => {
	it('should interact with db to update material', async () => {
		prisma.material.update = vi.fn().mockResolvedValue({
			id: 3,
			coverPic: 'cover1.jpg',
			publicationId: 1,
		});

		const material = await updateMaterialByPublicationId(11, {
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
			materialType: MaterialType.other,
			copyright: '© 2024 Quantum Learning Inc.',
			timeEstimate: 120, // time in minutes
			theoryPractice: 70,
		});
		expect(material).toMatchObject({
			id: 3,
			coverPic: 'cover1.jpg',
			publicationId: 1,
		});
		expect(prisma.material.update).toHaveBeenCalled();
	});
});
