import { describe, it, expect } from 'vitest';
import { buildMaterialForm } from '$lib/util/frontendTypes.ts';

// Builds a minimally-valid material FormData, letting individual fields be overridden.
function makeForm(overrides: Record<string, string> = {}): FormData {
	const fd = new FormData();
	fd.append('file', JSON.stringify({ title: 'f.pdf', type: 'pdf', info: 'gen-f.pdf' }));
	fd.append('tags', JSON.stringify(['ml']));
	fd.append('type', JSON.stringify(['other']));
	fd.append('learningObjectives', JSON.stringify(['lo']));
	fd.append('prerequisites', JSON.stringify(['pk']));
	fd.append('maintainers', JSON.stringify([]));
	fd.append('newTags', JSON.stringify([]));
	fd.append('userId', 'user-1');
	fd.append('title', 'Title');
	fd.append('description', 'Desc');
	fd.append('copyright', 'CC');
	fd.append('estimate', '30');
	fd.append('course', 'null');
	for (const [k, v] of Object.entries(overrides)) {
		fd.set(k, v);
	}
	return fd;
}

function metaOf(result: Awaited<ReturnType<typeof buildMaterialForm>>) {
	if (!('data' in result)) throw new Error(`buildMaterialForm rejected: ${JSON.stringify(result)}`);
	return result.data.metaData;
}

describe('buildMaterialForm selfMade parsing', () => {
	it('parses "true" as true', async () => {
		const meta = metaOf(await buildMaterialForm(makeForm({ selfMade: 'true' })));
		expect(meta.selfMade).toBe(true);
	});

	it('parses "false" as false', async () => {
		const meta = metaOf(await buildMaterialForm(makeForm({ selfMade: 'false' })));
		expect(meta.selfMade).toBe(false);
	});

	it('defaults to true when selfMade is missing', async () => {
		const meta = metaOf(await buildMaterialForm(makeForm()));
		expect(meta.selfMade).toBe(true);
	});

	it('defaults to true for an empty string (not the literal "false")', async () => {
		const meta = metaOf(await buildMaterialForm(makeForm({ selfMade: '' })));
		expect(meta.selfMade).toBe(true);
	});

	it('only the exact literal "false" disables it', async () => {
		const meta = metaOf(await buildMaterialForm(makeForm({ selfMade: 'FALSE' })));
		expect(meta.selfMade).toBe(true);
	});
});

describe('buildMaterialForm file validation', () => {
	it('requires a file when creating a publication', async () => {
		const form = makeForm();
		form.delete('file');

		await expect(buildMaterialForm(form)).resolves.toMatchObject({
			status: 400,
			message: 'No files provided',
		});
	});

	it('allows a metadata-only edit of an existing publication', async () => {
		const form = makeForm();
		form.delete('file');

		await expect(buildMaterialForm(form, false)).resolves.toHaveProperty('data');
	});
});

describe('buildMaterialForm course parsing', () => {
	it('represents no selected course as null', async () => {
		const meta = metaOf(await buildMaterialForm(makeForm({ course: 'null' })));
		expect(meta.course).toBeNull();
	});

	it('parses a selected course id', async () => {
		const meta = metaOf(await buildMaterialForm(makeForm({ course: '42' })));
		expect(meta.course).toBe(42);
	});

	it('rejects malformed course ids', async () => {
		await expect(buildMaterialForm(makeForm({ course: 'not-a-course' }))).resolves.toMatchObject({
			status: 400,
			message: 'Invalid course',
		});
	});
});
