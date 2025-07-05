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
import type { MaterialWithPublicationNoFiles } from '$lib/database/material';
import { createUniqueUser } from '../../utility/users';
import { createUniqueMaterial, generateRandomString } from '../../utility/publicationsUtility';

describe('Comments Liking', () => {
	let user: User;
	let publication: MaterialWithPublicationNoFiles;
	let comment: any;
	let content: string;
	let message: string;

	beforeEach(async () => {
		user = await createUniqueUser();
		publication = await createUniqueMaterial(user.id);
		content = generateRandomString(50);
		comment = await createComment({
			userId: user.id,
			publicationId: publication.publicationId,
			content,
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
