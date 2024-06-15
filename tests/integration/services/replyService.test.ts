import { it, beforeEach, describe, expect } from 'vitest';
import { Difficulty, type Material, type User } from '@prisma/client';
import {
	createComment,
	createMaterialPublication,
	createReply,
	createUser,
	deleteReply,
	getRepliesByCommentId,
	getReply,
	updateReply,
} from '$lib/database';

describe('Reply CRUD', () => {
	let user: User;
	let publication: Material;
	let comment: any;
	let reply: any;

	beforeEach(async () => {
		user = await createUser({
			firstName: 'Marti232',
			lastName: 'Parti232323',
			email: 'email@gmail' + Math.random(),
			password: 'password',
		});
		publication = await createMaterialPublication(user.id, {
			title: 'cool publication1',
			description: 'This publication has description',
			difficulty: Difficulty.easy,
			materialType: 'assignment',
			copyright: true,
			timeEstimate: 4,
			theoryPractice: 9,
			learningObjectives: [],
			prerequisites: [],
		});
		comment = await createComment({
			userId: user.id,
			publicationId: publication.publicationId,
			content: 'Ivan',
		});
		reply = await createReply({
			userId: user.id,
			commentId: comment.id,
			content: 'Ivan Reply',
		});
	});
	it('should add reply successfully', async () => {
		expect(reply).toBeTruthy();
		expect(reply.commentId).toEqual(comment.id);
		expect(reply.content).toEqual('Ivan Reply');
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
		await updateReply({
			id: reply.id,
			content: 'notIvan',
		});
		reply = await getReply(reply.id);
		expect(reply.content).toEqual('notIvan');
		expect(reply.createdAt).not.toEqual(reply.updatedAt);
		const replies = await getRepliesByCommentId(comment.id);
		expect(replies.length).toEqual(1);
	});
});
