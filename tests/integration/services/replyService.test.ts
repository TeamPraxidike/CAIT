import { it, beforeEach, describe, expect } from 'vitest';
import { type Material, type User } from '@prisma/client';
import {
	createComment,
	createReply,
	deleteReply,
	getRepliesByCommentId,
	getReply,
	updateReply,
} from '$lib/database';
import { createUniqueUser } from '../../utility/users';
import { createUniqueMaterial, generateRandomString } from '../../utility/publicationsUtility';

describe('Reply CRUD', () => {
	let user: User;
	let publication: Material;
	let comment: any;
	let contentComment: string;
	let contentReply: string;
	let reply: any;

	beforeEach(async () => {
		user = await createUniqueUser();
		publication = await createUniqueMaterial(user.id);
		contentComment = generateRandomString(50);
		contentReply = generateRandomString(50);
		comment = await createComment({
			userId: user.id,
			publicationId: publication.publicationId,
			content: contentComment,
		});
		reply = await createReply({
			userId: user.id,
			commentId: comment.id,
			content: contentReply,
		});
	});
	it('should add reply successfully', async () => {
		expect(reply).toBeTruthy();
		expect(reply.commentId).toEqual(comment.id);
		expect(reply.content).toEqual(contentReply);
		const replies = await getRepliesByCommentId(comment.id);
		expect(replies.length).toEqual(1);
	});
	it('should get reply successfully', async () => {
		const gotReply = await getReply(reply.id);
		expect(gotReply).toBeTruthy();
		expect(gotReply?.id).toEqual(reply.id);
		expect(gotReply?.content).toEqual(reply.content);
	});
	it('should delete reply successfully', async () => {
		await deleteReply(reply.id);

		const replies = await getRepliesByCommentId(comment.id);
		expect(replies.length).toEqual(0);
	});
	it('should update comment successfully', async () => {
		const updatedContent = generateRandomString(50);
		await updateReply({
			id: reply.id,
			content: updatedContent,
		});
		reply = await getReply(reply.id);
		expect(reply.content).toEqual(updatedContent);
		expect(reply.createdAt).not.toEqual(reply.updatedAt);
		const replies = await getRepliesByCommentId(comment.id);
		expect(replies.length).toEqual(1);
	});
});
