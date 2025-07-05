import { it, expect, describe, beforeEach } from 'vitest';
import { Difficulty, type Material, type User } from '@prisma/client';
import {
	addPublicationToUsedInCourse,
	createMaterialPublication,
	createUser,
} from '$lib/database';
import {
	getSavedPublications,
	isPublicationSaved,
	savePublication,
} from '$lib/database/save';
import type { MaterialWithPublicationNoFiles } from '$lib/database/material';
import { createUniqueUser } from '../../utility/users';
import { createUniqueMaterial } from '../../utility/publicationsUtility';

describe('Saving publications', () => {
	let user: User;
	let publication: MaterialWithPublicationNoFiles;
	let savedMessage: string;

	beforeEach(async () => {
		user = await createUniqueUser();
		publication = await createUniqueMaterial(user.id);
		savedMessage = await savePublication(
			user.id,
			publication.publicationId,
		);
	});

	it('should add it to the saved list', async () => {
		expect(savedMessage).toBe('Publication saved successfully');
		const saved = await getSavedPublications(user.id);
		if (saved === null) {
			throw Error('saved was null');
		}
		expect(saved.saved).toHaveLength(1);
		expect(saved.saved[0].id).toBe(publication.publicationId);
		expect(saved.saved[0].title).toBe(publication.publication.title);
	});

	it('should remove it from the saved list when unsaved', async () => {
		const response = await savePublication(
			user.id,
			publication.publicationId,
		);
		expect(response).toBe('Publication unsaved successfully');

		const saved = await getSavedPublications(user.id);
		if (saved === null) {
			throw Error('saved was null');
		}
		expect(saved.saved.length).toBe(0);
	});

	it('should only allow a user to save each publication once', async () => {
		for (let i = 0; i < 10; i++) {
			await savePublication(user.id, publication.publicationId);
		}
		const saved = await getSavedPublications(user.id);
		if (saved === null)
			throw new Error('Could not get saved publications list');
		expect(saved.saved.length).toBe(1);
	});

	it('correctly returns used courses', async () => {
		await addPublicationToUsedInCourse(user.id, publication.publicationId, [
			'ADS',
			'Calculus',
		]);
		const saved = await getSavedPublications(user.id);
		if (saved === null)
			throw new Error('Could not get saved publications list');

		expect(saved.saved.length).toBe(1);
		expect(saved.saved[0].usedInCourse).toHaveLength(2);
		const used = saved.saved[0].usedInCourse.map((x) => x.course);
		expect(used).toContain('ADS');
		expect(used).toContain('Calculus');
	});

	it('should get whether a publication was saved', async () => {
		const saved = await isPublicationSaved(
			user.id,
			publication.publicationId,
		);
		if (saved === null) {
			throw Error('saved was null');
		}
		expect(saved).toBe(true);

		await savePublication(user.id, publication.publicationId);

		const saved2 = await isPublicationSaved(
			user.id,
			publication.publicationId,
		);
		if (saved2 === null) {
			throw Error('liked was null');
		}
		expect(saved2).toBe(false);
	});
});
