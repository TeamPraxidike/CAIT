import { it, beforeEach, describe, expect } from 'vitest';
import { type User } from '@prisma/client';
import {
	createComment,
	getComment,
	updateComment,
	createReply,
	getReply,
} from '$lib/database';
import { createMaterialPublication } from '$lib/database/material';
import { createCourse } from '$lib/database/courses';
import {
	extractMentionedUserIds,
	type TiptapDocument,
} from '$lib/util/content';
import { createUniqueUser } from '../../utility/users';
import { generateRandomString } from '../../utility/publicationsUtility';

/**
 * Helper to build a TipTap document with a text paragraph that @mentions
 * the given users.
 */
function buildTiptapDocWithMentions(
	text: string,
	mentions: { id: string; label: string }[],
): TiptapDocument {
	const inlineContent: any[] = [];

	if (text) {
		inlineContent.push({ type: 'text', text: text + ' ' });
	}

	for (const mention of mentions) {
		inlineContent.push({
			type: 'mention',
			attrs: { id: mention.id, label: mention.label },
		});
		inlineContent.push({ type: 'text', text: ' ' });
	}

	return {
		type: 'doc',
		content: [
			{
				type: 'paragraph',
				content: inlineContent,
			},
		],
	};
}

/**
 * Creates a minimal material publication for testing.
 */
async function createTestPublication(userId: string) {
	const course = await createCourse({
		learningObjectives: ['test'],
		prerequisites: ['test'],
		educationalLevel: 'undergraduate',
		courseName: generateRandomString(15),
		creatorId: userId,
		maintainers: [],
		copyright: 'test',
		coverPic: null,
	});

	return createMaterialPublication(userId, {
		title: generateRandomString(),
		description: generateRandomString(50),
		difficulty: 'easy',
		learningObjectives: ['test'],
		prerequisites: ['test'],
		materialType: ['lectureNotes'],
		copyright: 'test',
		timeEstimate: 5,
		theoryPractice: 0.5,
		isDraft: false,
		course: course.id,
	});
}

describe('Comments with TipTap JSON content', () => {
	let author: User;
	let mentionedUser: User;
	let publicationId: number;

	beforeEach(async () => {
		author = await createUniqueUser();
		mentionedUser = await createUniqueUser();
		const publication = await createTestPublication(author.id);
		publicationId = publication.publicationId;
	});

	it('should store and retrieve a TipTap document with a mention', async () => {
		const doc = buildTiptapDocWithMentions('Hello', [
			{ id: mentionedUser.id, label: mentionedUser.username },
		]);

		const comment = await createComment({
			userId: author.id,
			publicationId,
			content: doc,
		});

		expect(comment).toBeTruthy();
		expect(comment.content).toEqual(doc);
	});

	it('should retrieve mention structure intact after reading back', async () => {
		const doc = buildTiptapDocWithMentions('Check this out', [
			{ id: mentionedUser.id, label: mentionedUser.username },
		]);

		const comment = await createComment({
			userId: author.id,
			publicationId,
			content: doc,
		});

		const retrieved = await getComment(comment.id);
		expect(retrieved).toBeTruthy();

		const content = retrieved.content as unknown as TiptapDocument;
		expect(content.type).toBe('doc');
		expect(content.content).toBeDefined();
		expect(content.content![0].type).toBe('paragraph');

		// Find the mention node in the paragraph content
		const mentionNode = content.content![0].content!.find(
			(n: any) => n.type === 'mention',
		);
		expect(mentionNode).toBeDefined();
		expect(mentionNode!.attrs!.id).toBe(mentionedUser.id);
		expect(mentionNode!.attrs!.label).toBe(mentionedUser.username);
	});

	it('should extract mentioned user IDs from stored content', async () => {
		const secondMentioned = await createUniqueUser();
		const doc = buildTiptapDocWithMentions('Hey', [
			{ id: mentionedUser.id, label: mentionedUser.username },
			{ id: secondMentioned.id, label: secondMentioned.username },
		]);

		const comment = await createComment({
			userId: author.id,
			publicationId,
			content: doc,
		});

		const retrieved = await getComment(comment.id);
		const ids = extractMentionedUserIds(
			retrieved.content as unknown as TiptapDocument,
		);

		expect(ids).toContain(mentionedUser.id);
		expect(ids).toContain(secondMentioned.id);
		expect(ids).toHaveLength(2);
	});

	it('should update a comment to add a mention', async () => {
		// Start with plain text content
		const initialDoc: TiptapDocument = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [{ type: 'text', text: 'Initial text' }],
				},
			],
		};

		const comment = await createComment({
			userId: author.id,
			publicationId,
			content: initialDoc,
		});

		// Update with a mention
		const updatedDoc = buildTiptapDocWithMentions('Updated with mention', [
			{ id: mentionedUser.id, label: mentionedUser.username },
		]);

		await updateComment({ id: comment.id, content: updatedDoc });

		const retrieved = await getComment(comment.id);
		const ids = extractMentionedUserIds(
			retrieved.content as unknown as TiptapDocument,
		);
		expect(ids).toContain(mentionedUser.id);
		expect(ids).toHaveLength(1);
	});

	it('should store and retrieve an empty TipTap document', async () => {
		const emptyDoc: TiptapDocument = { type: 'doc', content: [] };

		const comment = await createComment({
			userId: author.id,
			publicationId,
			content: emptyDoc,
		});

		const retrieved = await getComment(comment.id);
		const content = retrieved.content as unknown as TiptapDocument;
		expect(content.type).toBe('doc');
		expect(content.content).toEqual([]);
	});
});

describe('Replies with TipTap JSON content', () => {
	let author: User;
	let mentionedUser: User;
	let commentId: number;

	beforeEach(async () => {
		author = await createUniqueUser();
		mentionedUser = await createUniqueUser();
		const publication = await createTestPublication(author.id);

		const comment = await createComment({
			userId: author.id,
			publicationId: publication.publicationId,
			content: {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [{ type: 'text', text: 'Parent comment' }],
					},
				],
			},
		});
		commentId = comment.id;
	});

	it('should store and retrieve a reply with a TipTap mention', async () => {
		const doc = buildTiptapDocWithMentions('Thanks', [
			{ id: author.id, label: author.username },
		]);

		const reply = await createReply({
			userId: mentionedUser.id,
			commentId,
			content: doc,
		});

		expect(reply).toBeTruthy();
		expect(reply.content).toEqual(doc);
	});

	it('should extract mentioned user IDs from a reply', async () => {
		const doc = buildTiptapDocWithMentions('Replying to', [
			{ id: author.id, label: author.username },
		]);

		const reply = await createReply({
			userId: mentionedUser.id,
			commentId,
			content: doc,
		});

		const retrieved = await getReply(reply.id);
		const ids = extractMentionedUserIds(
			retrieved.content as unknown as TiptapDocument,
		);

		expect(ids).toContain(author.id);
		expect(ids).toHaveLength(1);
	});
});
