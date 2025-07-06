import { it, expect, describe, beforeEach } from 'vitest';
import { type User } from '@prisma/client';
import {
	addPublicationToUsedInCourse,
	coursesUsingPublication,
	publicationsAUserUses,
} from '$lib/database';
import { createUniqueUser } from '../../utility/users';
import { createUniqueMaterial } from '../../utility/publicationsUtility';
import type { MaterialWithPublicationNoFiles } from '$lib/database/material';

describe('Using in a course', () => {
	let user: User;
	let publication: MaterialWithPublicationNoFiles;
	let publication2: MaterialWithPublicationNoFiles;

	beforeEach(async () => {
		user = await createUniqueUser();
		publication = await createUniqueMaterial(user.id);
		publication2 = await createUniqueMaterial(user.id);
	});

	it('should add to the list of used in course', async () => {
		await addPublicationToUsedInCourse(user.id, publication.publicationId, [
			'PTS',
		]);
		const courses = await coursesUsingPublication(
			publication.publicationId,
		);
		expect(courses).length.greaterThanOrEqual(1);
		expect(courses).toContain('PTS');
	});

	it('should add multiple records to the list', async () => {
		await addPublicationToUsedInCourse(user.id, publication.publicationId, [
			'ADS',
			'CPL',
			'ACC',
		]);
		const courses = await coursesUsingPublication(publication.publicationId);
		expect(courses).toHaveLength(3);
		expect(courses).toContain('ADS');
		expect(courses).toContain('CPL');
		expect(courses).toContain('ACC');
	});

	it('should add to the list of what users use', async () => {
		await addPublicationToUsedInCourse(user.id, publication.publicationId, [
			'ADS',
		]);
		const publications = (await publicationsAUserUses(user.id)).map(
			(x:any) => x.id,
		);
		expect(publications).toHaveLength(1);
		expect(publications).toContain(publication.publicationId);
	});

	it('should add to the list of what users use across multiple publications', async () => {
		await addPublicationToUsedInCourse(user.id, publication.publicationId, ['ADS']);
		await addPublicationToUsedInCourse(user.id, publication2.publicationId, ['CPL']);
		await addPublicationToUsedInCourse(user.id, publication.publicationId, ['CG']);
		const publications = (await publicationsAUserUses(user.id)).map(
			(x:any) => x.id,
		);
		expect(publications).toHaveLength(2);
		expect(publications).toContain(publication.publicationId);
		expect(publications).toContain(publication2.publicationId);
	});
});
