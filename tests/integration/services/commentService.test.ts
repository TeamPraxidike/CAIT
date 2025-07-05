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
import type { MaterialWithPublicationNoFiles } from '$lib/database/material';
import { createUniqueUser } from '../../utility/users';
import { createUniqueMaterial, generateRandomString } from '../../utility/publicationsUtility';

describe('Comments CRUD', () => {
	let user: User;
	let publication: MaterialWithPublicationNoFiles;
	let comment: any;
	let content: string;

	beforeEach(async () => {
		user = await createUniqueUser();
		publication = await createUniqueMaterial(user.id);
		content = generateRandomString(50);
		comment = await createComment({
			userId: user.id,
			publicationId: publication.publicationId,
			content,
		});
	});
	it('should add comment successfully', async () => {
		expect(comment).toBeTruthy();
		expect(comment.publicationId).toEqual(publication.publicationId);
		expect(comment.content).toEqual(content);
		const comments = await getCommentsByPublicationId(
			publication.publicationId,
		);
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

		const comments = await getCommentsByPublicationId(
			publication.publicationId,
		);
		expect(comments.length).toEqual(0);
	});
	it('should update comment successfully', async () => {
		const newContent = generateRandomString(50);
		comment = await updateComment({
			id: comment.id,
			content: newContent,
		});
		expect(comment.content).toEqual(newContent);
		expect(comment.createdAt).not.toEqual(comment.updatedAt);
		const comments = await getCommentsByPublicationId(
			publication.publicationId,
		);
		expect(comments.length).toEqual(1);
	});
});
