import { it, beforeEach, describe, expect } from 'vitest';
import { Difficulty, type Material, type User } from '@prisma/client';
import {
	createComment,
	createMaterialPublication,
	createUser,
	getComment,
	getLikedComments,
	likesCommentUpdate,
} from '$lib/database';

describe('Comments Liking', () => {
	let user: User;
	let publication: Material;
	let comment: any;
	let message: string;
	beforeEach(async () => {
		user = await createUser({
			firstName: 'Marti12345431143',
			lastName: 'Parti',
			email: 'email@gmail' + Math.random(),
			password: 'password',
		});
		publication = await createMaterialPublication(user.id, {
			title: 'cool publication',
			description: 'This publication has description',
			difficulty: Difficulty.easy,
			materialType: 'presentation',
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
		message = await likesCommentUpdate(user.id, comment.id);
	});
	it('should add like successfully', async () => {
		comment = await getComment(comment.id);
		expect(comment.likes).toEqual(1);
		const likedComments = await getLikedComments(user.id);
		expect(likedComments?.likedComments).toHaveLength(1);
		expect(message).toEqual('Comment liked successfully');
	});
	it('should remove like successfully when already liked', async () => {
		message = await likesCommentUpdate(user.id, comment.id);
		comment = await getComment(comment.id);
		expect(comment.likes).toEqual(0);
		const likedComments = await getLikedComments(user.id);
		expect(likedComments?.likedComments).toHaveLength(0);
		expect(message).toEqual('Comment unliked successfully');
	});
});
