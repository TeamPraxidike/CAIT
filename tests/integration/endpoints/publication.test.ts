import { describe, it, expect, beforeEach } from 'vitest';
import { apiTestingUrl } from '../setup';
import { prisma } from '$lib/database';
import { getAllPublications, getAllPublicationsByIds, getPublicationById } from '$lib/database/db';
import {
	handleConnections,
	checkMaintainerList,
	checkTagList,
	connectMaintainers,
	connectTags,
	getMaintainers,
	getPublisher,
	getPublisherId,
	getReportsPublication,
	updateAllTimeSaved,
	updatePublicationConnectMaintainers,
	updatePublicationConnectTags,
} from '$lib/database/publication';
import { addTag } from '$lib/database/tag';
import { createUniqueUser } from '../../utility/users';
import { createUniqueMaterial, generateRandomString } from '../../utility/publicationsUtility';
import type { User } from '@prisma/client';

const get = (path: string) => fetch(`${apiTestingUrl}${path}`, { method: 'GET' });

// Tests are scoped to the freshly created publisher (by id) so they stay isolated
describe('PUBLICATION API', () => {
	let user: User;
	beforeEach(async () => {
		user = await createUniqueUser();
	});

	describe('GET /api/publication (browse)', () => {
		it('returns every published publication for a publisher with its id list', async () => {
			const a = await createUniqueMaterial(user.id);
			const b = await createUniqueMaterial(user.id);

			const body = await (await get(`/publication?publishers=${user.id}`)).json();
			expect(body.publications).toHaveLength(2);
			expect(body.ids).toEqual(expect.arrayContaining([a.publicationId, b.publicationId]));

			const direct = await getAllPublications([user.id], '', 'Most Recent');
			expect(direct.map((p: { id: number }) => p.id)).toEqual(
				expect.arrayContaining([a.publicationId, b.publicationId]),
			);
		});

		it('caps publications at the requested amount but still lists every id', async () => {
			for (let i = 0; i < 3; i++) await createUniqueMaterial(user.id);

			const body = await (await get(`/publication?publishers=${user.id}&amount=2`)).json();
			expect(body.publications).toHaveLength(2);
			expect(body.ids).toHaveLength(3);
		});

		it('filters drafts out by default and keeps them with includeDraft=true', async () => {
			await createUniqueMaterial(user.id);
			const draft = await createUniqueMaterial(user.id);
			await prisma.publication.update({
				where: { id: draft.publicationId },
				data: { isDraft: true },
			});

			const published = await getAllPublications([user.id], '', 'Most Recent');
			expect(published.map((p: { id: number }) => p.id)).not.toContain(draft.publicationId);

			const withDrafts = await getAllPublications([user.id], '', 'Most Recent', true);
			expect(withDrafts.map((p: { id: number }) => p.id)).toContain(draft.publicationId);

			const body = await (await get(`/publication?publishers=${user.id}`)).json();
			expect(body.ids).not.toContain(draft.publicationId);
		});

		it('fuzzy-searches publications by title', async () => {
			const target = await createUniqueMaterial(user.id);
			await createUniqueMaterial(user.id);

			const direct = await getAllPublications([user.id], target.publication.title, 'Most Recent');
			expect(direct[0].id).toBe(target.publicationId);

			const body = await (
				await get(`/publication?publishers=${user.id}&q=${target.publication.title}`)
			).json();
			expect(body.publications[0].id).toBe(target.publicationId);
		});

		it('scopes results to the requested publisher', async () => {
			const mine = await createUniqueMaterial(user.id);
			const other = await createUniqueUser();
			const theirs = await createUniqueMaterial(other.id);

			const ids = (await getAllPublications([user.id], '', 'Most Recent')).map((p: { id: number }) => p.id);
			expect(ids).toContain(mine.publicationId);
			expect(ids).not.toContain(theirs.publicationId);
		});
	});

	describe('GET /api/publication/[publicationId]', () => {
		it('returns the full material publication including its relations', async () => {
			const material = await createUniqueMaterial(user.id);

			const response = await get(`/publication/${material.publicationId}`);
			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.isMaterial).toBe(true);
			expect(body.publication.id).toBe(material.publicationId);

			const direct = await getPublicationById(material.publicationId);
			expect(direct.publisherId).toBe(user.id);
			expect(direct).toHaveProperty('comments');
			expect(direct).toHaveProperty('materials');
		});

		it('responds with 400 for a non-positive id', async () => {
			expect((await get('/publication/-1')).status).toBe(400);
		});

		it('responds with 404 for a publication that does not exist', async () => {
			expect((await get('/publication/999999999')).status).toBe(404);
		});
	});

	describe('GET /api/publication/set', () => {
		it('returns only the requested publication ids', async () => {
			const a = await createUniqueMaterial(user.id);
			const b = await createUniqueMaterial(user.id);
			const excluded = await createUniqueMaterial(user.id);

			const direct = await getAllPublicationsByIds(
				[a.publicationId, b.publicationId],
				'Most Recent',
			);
			expect(direct).toHaveLength(2);
			expect(direct.map((p: { id: number }) => p.id)).toEqual(
				expect.arrayContaining([a.publicationId, b.publicationId]),
			);

			const body = await (
				await get(`/publication/set?ids=${a.publicationId},${b.publicationId}`)
			).json();
			const returnedIds = body.publications.map((p: { id: number }) => p.id);
			expect(returnedIds).toHaveLength(2);
			expect(returnedIds).not.toContain(excluded.publicationId);
		});
	});

	// Direct data-layer coverage for publication.ts (tag/maintainer connections,
	// publisher lookups, report counts and all-time saves).
	describe('publication.ts data layer', () => {
		it('links maintainers and tags onto a publication', async () => {
			const material = await createUniqueMaterial(user.id);
			const m1 = await createUniqueUser();
			const m2 = await createUniqueUser();
			const tagA = generateRandomString(8).toLowerCase();
			const tagB = generateRandomString(8).toLowerCase();
			await addTag(tagA);
			await addTag(tagB);

			await handleConnections([tagA, tagB], [m1.id, m2.id], material.publicationId);

			const maintainers = await getMaintainers(material.publicationId);
			expect(maintainers!.maintainers.map((u) => u.id)).toEqual(
				expect.arrayContaining([m1.id, m2.id]),
			);

			const pub = await getPublicationById(material.publicationId);
			expect(pub.tags.map((t) => t.content)).toEqual(expect.arrayContaining([tagA, tagB]));
		});

		it('replaces existing tag and maintainer connections on reconnect', async () => {
			const material = await createUniqueMaterial(user.id);
			const m1 = await createUniqueUser();
			const m2 = await createUniqueUser();
			const tagA = generateRandomString(8).toLowerCase();
			const tagB = generateRandomString(8).toLowerCase();
			await addTag(tagA);
			await addTag(tagB);

			await connectMaintainers(material.publicationId, [m1.id]);
			await connectTags(material.publicationId, [tagA]);

			// reconnecting wipes the previous set and establishes the new one
			await updatePublicationConnectMaintainers(material.publicationId, [m2.id]);
			await updatePublicationConnectTags(material.publicationId, [tagB]);

			const maintainers = await getMaintainers(material.publicationId);
			expect(maintainers!.maintainers.map((u) => u.id)).toEqual([m2.id]);

			const pub = await getPublicationById(material.publicationId);
			expect(pub.tags.map((t) => t.content)).toEqual([tagB]);
		});

		it('rejects invalid maintainer and tag lists', async () => {
			await expect(checkMaintainerList([undefined])).rejects.toThrow();
			await expect(checkTagList([''])).rejects.toThrow();

			const material = await createUniqueMaterial(user.id);
			await expect(connectMaintainers(material.publicationId, [undefined])).rejects.toThrow();
			await expect(connectTags(material.publicationId, [''])).rejects.toThrow();
		});

		it('returns the publisher of a publication', async () => {
			const material = await createUniqueMaterial(user.id);

			const publisher = await getPublisher(material.publicationId);
			expect(publisher!.publisher.id).toBe(user.id);

			const publisherId = await getPublisherId(material.publicationId);
			expect(publisherId.publisherId).toBe(user.id);
		});

		it('counts the reports against a publication', async () => {
			const material = await createUniqueMaterial(user.id);
			expect((await getReportsPublication(material.publicationId))._count.reportedBy).toBe(0);

			const reporter = await createUniqueUser();
			await prisma.publication.update({
				where: { id: material.publicationId },
				data: { reportedBy: { connect: { id: reporter.id } } },
			});
			expect((await getReportsPublication(material.publicationId))._count.reportedBy).toBe(1);
		});

		it('records an all-time save only once and no-ops for a missing publication', async () => {
			const material = await createUniqueMaterial(user.id);
			const saver = await createUniqueUser();

			const first = await updateAllTimeSaved(saver.id, material.publicationId);
			expect(first).not.toBe('User saved previously');

			const second = await updateAllTimeSaved(saver.id, material.publicationId);
			expect(second).toBe('User saved previously');

			expect(await updateAllTimeSaved(saver.id, 999999999)).toBeUndefined();
		});
	});
});
