import { prisma } from '$lib/database';

export type editReplyData = {
	id: number;
	content: string;
};

export type createReplyData = {
	userId: number;
	commentId: number;
	content: string;
};

/**
 * [POST] creates a reply from the given body
 * @param reply
 */
export async function createReply(reply: createReplyData) {
	return prisma.reply.create({
		data: {
			content: reply.content,
			userId: reply.userId,
			commentId: reply.commentId,
		},
	});
}
/**
 * [GET] gets the reply with the given id
 * @param replyId
 */
export async function getReply(replyId: number) {
	return prisma.reply.findUnique({
		where: {
			id: replyId,
		},
	});
}
/**
 * [DELETE] deletes the reply with the given id
 * @param replyId
 */
export async function deleteReply(replyId: number) {
	return prisma.reply.findUnique({
		where: {
			id: replyId,
		},
	});
}

/**
 * [PUT] updates the content of a comment wth the id from the param to the content of the param
 * @param reply -  a custom data comment data to update the comment content
 */
export async function updateReply(reply: editReplyData) {
	return prisma.reply.update({
		where: {
			id: reply.id,
		},
		data: {
			content: reply.content,
		},
	});
}
