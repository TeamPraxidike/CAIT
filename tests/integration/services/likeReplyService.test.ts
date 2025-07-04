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
import { createUniqueUser } from '../../utility/users';
import { createUniquePublication, generateRandomString } from '../../utility/publicationsUtility';

describe('Comments Liking', () => {
	let user: User;
	let publication: Material;
	let comment: any;
	let contentComment: string;
	let reply: any;
	let contentReply: string;
	let message: string;
	beforeEach(async () => {
		user = await createUniqueUser();
		publication = await createUniquePublication(user.id);
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
