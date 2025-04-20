import { prisma } from '$lib/database';
import { Prisma } from '@prisma/client';

export type editCommentData = {
	id: number;
	content: string;
};

export type createCommentData = {
	userId: string;
	publicationId: number;
	content: string;
};

export type CommentWithRepliesAndUsers = Prisma.CommentGetPayload<{
	include: {
		user: true,
		replies: {
			include: {
				user: true,
			},
		},
	}
}>;

export type FullComment = Prisma.CommentGetPayload<{
	include: {
		replies: {
			include: {
				user: true,
			},
		},
		user: true,
		likedBy: true,
	}
}>;

export type CommentWithRepliesAndLiked = Prisma.CommentGetPayload<{
	include: {
		replies: true,
		likedBy: true,
	}
}>;

/**
 * [POST] creates a comment from the given body
 * @param comment
 */
export async function createComment(comment: createCommentData): Promise<CommentWithRepliesAndUsers> {
	return prisma.comment.create({
		data: {
			content: comment.content,
			userId: comment.userId,
			publicationId: comment.publicationId,
			updatedAt: new Date(),
		},
		include: {
			user: true,
			replies: {
				include: {
					user: true,
				},
			},
		},
	});
}
/**
 * [GET] gets the comment with the given id
 * @param commentId
 */
export async function getComment(commentId: number): Promise<CommentWithRepliesAndLiked> {
	return prisma.comment.findUnique({
		where: {
			id: commentId,
		},
		include: {
			replies: true,
			likedBy: true,
		},
	});
}

/**
 * [GET] gets the comment with the given publication id
 * @param publicationId
 */
export async function getCommentsByPublicationId(publicationId: number): Promise<FullComment> {
	return prisma.comment.findMany({
		where: {
			publicationId: publicationId,
		},
		include: {
			replies: {
				include: {
					user: true,
				},
			},
			user: true,
			likedBy: true,
		},
	});
}

/**
 * [DELETE] deletes the comment with the given id
 * @param commentId
 */
export async function deleteComment(commentId: number): Promise<Prisma.CommentGetPayload<true>> {
	return prisma.comment.delete({
		where: {
			id: commentId,
		},
	});
}

/**
 * [PUT] updates the content of a comment wth the id from the param to the content of the param
 * @param comment -  a custom data comment data to update the comment content
 */
export async function updateComment(comment: editCommentData): Promise<Prisma.CommentGetPayload<true>> {
	return prisma.comment.update({
		where: {
			id: comment.id,
		},
		data: {
			content: comment.content,
			updatedAt: new Date(),
		},
	});
}
