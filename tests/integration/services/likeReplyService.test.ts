import { it, beforeEach, describe, expect } from 'vitest';
import { Difficulty, type Material, type User } from '@prisma/client';
import {
	createComment,
	createMaterialPublication,
	createReply,
	createUser,
	getLikedReplies,
	getReply,
	likesReplyUpdate,
} from '$lib/database';

describe('Comments Liking', () => {
	let user: User;
	let publication: Material;
	let comment: any;
	let reply: any;
	let message: string;
	beforeEach(async () => {
		user = await createUser({
			firstName: 'Marti',
			lastName: 'Parti',
			email: 'email@gmail' + Math.random(),
			password: 'password',
		});
		publication = await createMaterialPublication(user.id, {
			title: 'cool publication',
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
		message = await likesReplyUpdate(user.id, reply.id);
	});
	it('should add like successfully to reply', async () => {
		reply = await getReply(reply.id);
		expect(reply.likes).toEqual(1);
		const likedReplies = await getLikedReplies(user.id);
		expect(likedReplies?.likedReplies).toHaveLength(1);
		expect(message).toEqual('Reply liked successfully');
	});
	it('should remove like successfully when already liked', async () => {
		message = await likesReplyUpdate(user.id, reply.id);
		reply = await getReply(reply.id);
		expect(reply.likes).toEqual(0);
		const likedReplies = await getLikedReplies(user.id);
		expect(likedReplies?.likedReplies).toHaveLength(0);
		expect(message).toEqual('Reply unliked successfully');
	});
});
