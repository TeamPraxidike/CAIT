import { it, beforeEach, describe, expect } from 'vitest';
import { Difficulty, type Material, type User } from '@prisma/client';
import {
	createComment,
	createMaterialPublication,
	createUser,
	deleteComment,
	getComment,
	getCommentsByPublicationId,
	updateComment,
} from '$lib/database';

describe('Comments CRUD', () => {
	let user: User;
	let publication: Material;
	let comment: any;

	beforeEach(async () => {
		user = await createUser(
			'Bobere',
			'Damyanov',
			'email2@email',
			'vasko.pdf',
		);
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
		comment = await createComment({
			userId: user.id,
			publicationId: publication.id,
			content: 'Ivan',
		});
	});
	it('should add comment successfully', async () => {
		expect(comment).toBeTruthy();
		expect(comment.publicationId).toEqual(publication.id);
		expect(comment.content).toEqual('Ivan');
		const comments = await getCommentsByPublicationId(publication.id);
		expect(comments.length).toEqual(1);
	});
	it('should get comment successfully', async () => {
		const gotComment = await getComment(comment.id);
		expect(gotComment).toBeTruthy();
		expect(gotComment?.id).toEqual(comment.id);
		expect(gotComment?.content).toEqual(comment.content);
	});
	it('should delete comment successfully', async () => {
		await deleteComment(comment.id);

		const comments = await getCommentsByPublicationId(publication.id);
		expect(comments.length).toEqual(0);
	});
	it('should update comment successfully', async () => {
		comment = await updateComment({
			id: comment.id,
			content: 'notIvan',
		});
		expect(comment.content).toEqual('notIvan');
		expect(comment.createdAt).not.toEqual(comment.updatedAt);
		const comments = await getCommentsByPublicationId(publication.id);
		expect(comments.length).toEqual(1);
	});
});
