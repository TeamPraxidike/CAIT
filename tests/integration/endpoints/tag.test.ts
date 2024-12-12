import { describe, it, expect } from 'vitest';
import { testingUrl } from '../setup';

// await resetTagsTable();

describe('[POST]/[GET] /api/tags', () => {
	it('should add a tag to the database', async () => {
		const response = await fetch(`${testingUrl}/tags`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				tags: ['a tag'],
			}),
		});

		expect(response.status).toBe(200);

		const response2 = await fetch(`${testingUrl}/tags`);
		expect(response2.status).toBe(200);
		const body = (await response2.json()).map(
			(tag: { content: string }) => tag.content,
		);

		expect(body).toContain('a tag');
	});

	it('should return 200 when adding duplicates', async () => {
		const response = await fetch(`${testingUrl}/tags`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				tags: ['hello'],
			}),
		});
		expect(response.status).toBe(200);

		const response2 = await fetch(`${testingUrl}/tags`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				tags: ['hello'],
			}),
		});
		expect(response2.status).toBe(200);

		const response3 = await fetch(`${testingUrl}/tags`);
		expect(response3.status).toBe(200);
		const body = (await response3.json()).map(
			(tag: { content: string }) => tag.content,
		);

		expect(body.filter((x: string) => x === 'a tag')).toHaveLength(1);
	});
});

describe('[GET] /api/tags/{content}', () => {
	it('should return 200 when tag exists', async () => {
		const response1 = await fetch(`${testingUrl}/tags`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				tags: ['bojidar'],
			}),
		});
		expect(response1.status).toBe(200);

		const response2 = await fetch(`${testingUrl}/tags/bojidar`);
		expect(response2.status).toBe(200);

		const body = await response2.json();
		expect(body.content).toBe('bojidar');
	});

	it('should return 404 when tag does not exist', async () => {
		const response = await fetch(`${testingUrl}/tags/does not exist`);
		expect(response.status).toBe(404);
	});
});

describe('[DELETE] /api/tags/{content}', () => {
	it('should delete existing tags', async () => {
		const tagName = "coolTag12313"
		const response1 = await fetch(`${testingUrl}/tags`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				tags: [tagName],
			}),
		});
		expect(response1.status).toBe(200);

		const response2 = await fetch(`${testingUrl}/tags/${tagName}`, {
			method: 'DELETE',
		});
		expect(response2.status).toBe(200);

		const response3 = await fetch(`${testingUrl}/tags/${tagName}`);
		expect(response3.status).toBe(404);
	});

	it('should return 404 if tag doesnt exist', async () => {
		const response2 = await fetch(`${testingUrl}/tags/doesNotExist`, {
			method: 'DELETE',
		});
		expect(response2.status).toBe(404);
	});
});
