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
	fd.append('course', '0');
	for (const [k, v] of Object.entries(overrides)) {
		fd.set(k, v);
	}
	return fd;
}

function metaOf(result: Awaited<ReturnType<typeof buildMaterialForm>>) {
	if (!('data' in result)) throw new Error(`buildMaterialForm rejected: ${JSON.stringify(result)}`);
	return result.data.metaData;
}

function errorOf(result: Awaited<ReturnType<typeof buildMaterialForm>>) {
	if ('data' in result) throw new Error('buildMaterialForm unexpectedly accepted the form');
	return result;
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

	it('requires an explicit answer when selfMade is missing', async () => {
		const error = errorOf(await buildMaterialForm(makeForm()));
		expect(error).toMatchObject({
			status: 400,
			message: 'Please specify whether you made this material yourself',
		});
	});

	it('rejects an empty answer', async () => {
		const error = errorOf(await buildMaterialForm(makeForm({ selfMade: '' })));
		expect(error.status).toBe(400);
	});

	it('rejects values other than the exact boolean literals', async () => {
		const error = errorOf(await buildMaterialForm(makeForm({ selfMade: 'FALSE' })));
		expect(error.status).toBe(400);
	});
});
