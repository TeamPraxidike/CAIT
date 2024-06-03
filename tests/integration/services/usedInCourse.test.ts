import { it, expect, describe, beforeEach } from 'vitest';
import { Difficulty, type Material, type User } from '@prisma/client';
import { createMaterialPublication, createUser } from '$lib/database';
import {
	addPublicationToUsedInCourse,
	coursesUsingPublication,
	publicationsAUserUses,
} from '$lib/database';

describe('Using in a course', () => {
	let user: User;
	let publication: Material;
	let publication2: Material;

	beforeEach(async () => {
		user = await createUser({
			firstName: 'Marti2323',
			lastName: 'Parti',
			email: 'email@gmail' + Math.random(),
			password: 'password',
		});
		publication = await createMaterialPublication(user.id, {
			title: 'cool publication',
			description: 'This publication has description',
			difficulty: Difficulty.easy,
			materialType: 'video',
			copyright: true,
			timeEstimate: 4,
			theoryPractice: 9,
			learningObjectives: [],
			prerequisites: [],
		});
		publication2 = await createMaterialPublication(user.id, {
			title: 'cool publication',
			description: 'This publication has description',
			difficulty: Difficulty.easy,
			materialType: 'video',
			copyright: true,
			timeEstimate: 4,
			theoryPractice: 9,
			learningObjectives: [],
			prerequisites: [],
		});
	});

	it('should add to the list of used in course', async () => {
		await addPublicationToUsedInCourse(user.id, publication.publicationId, ['PTS']);
		const courses = await coursesUsingPublication(publication.publicationId);
		expect(courses).length.greaterThanOrEqual(1);
		expect(courses).toContain('PTS');
	});

	it('should add multiple records to the list', async () => {
		await addPublicationToUsedInCourse(user.id, publication.id, [
			'ADS',
			'CPL',
			'ACC',
		]);
		const courses = await coursesUsingPublication(publication.id);
		expect(courses).toHaveLength(3);
		expect(courses).toContain('ADS');
		expect(courses).toContain('CPL');
		expect(courses).toContain('ACC');
	});

	it('should add to the list of what users use', async () => {
		await addPublicationToUsedInCourse(user.id, publication.publicationId, ['ADS']);
		const publications = (await publicationsAUserUses(user.id)).map(
			(x) => x.id,
		);
		expect(publications).toHaveLength(1);
		expect(publications).toContain(publication.publicationId);
	});

	it('should add to the list of what users use across multiple publications', async () => {
		await addPublicationToUsedInCourse(user.id, publication.id, ['ADS']);
		await addPublicationToUsedInCourse(user.id, publication2.id, ['CPL']);
		await addPublicationToUsedInCourse(user.id, publication.id, ['CG']);
		const publications = (await publicationsAUserUses(user.id)).map(
			(x) => x.id,
		);
		expect(publications).toHaveLength(2);
		expect(publications).toContain(publication.id);
		expect(publications).toContain(publication2.id);
	});

});
