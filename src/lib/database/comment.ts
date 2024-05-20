import { prisma } from '$lib/database';

export type editCommentData = {
	id: number;
	content: string;
};

export type createCommentData = {
	userId: number;
	publicationId: number;
	content: string;
};

/**
 * [POST] creates a comment from the given body
 * @param comment
 */
export async function createComment(comment: createCommentData) {
	return prisma.comment.create({
		data: {
			content: comment.content,
			userId: comment.userId,
			publicationId: comment.publicationId,
		},
	});
}
/**
 * [GET] gets the comment with the given id
 * @param commentId
 */
export async function getComment(commentId: number) {
	return prisma.comment.findUnique({
		where: {
			id: commentId,
		},
		include: {
			replies: true,
		},
	});
}
/**
 * [DELETE] deletes the comment with the given id
 * @param commentId
 */
export async function deleteComment(commentId: number) {
	return prisma.comment.findUnique({
		where: {
			id: commentId,
		},
	});
}

/**
 * [PUT] updates the content of a comment wth the id from the param to the content of the param
 * @param comment -  a custom data comment data to update the comment content
 */
export async function updateComment(comment: editCommentData) {
	return prisma.comment.update({
		where: {
			id: comment.id,
		},
		data: {
			content: comment.content,
		},
	});
}
