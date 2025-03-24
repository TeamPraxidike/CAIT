import { prisma } from '$lib/database';
import { Prisma } from '@prisma/client';

export type editReplyData = {
	id: number;
	content: string;
};

export type createReplyData = {
	userId: string;
	commentId: number;
	content: string;
};

export type ReplyLikedBy = Prisma.ReplyGetPayload<{
	include: { likedBy: true };
}>;

export type ReplyWithUser = Prisma.ReplyGetPayload<{
	include: { user: true };
}>;

export type Reply = Prisma.ReplyGetPayload<true>;

/**
 * [POST] creates a reply from the given body
 * @param reply
 */
export async function createReply(reply: createReplyData): Promise<ReplyWithUser>  {
	return prisma.reply.create({
		data: {
			content: reply.content,
			userId: reply.userId,
			commentId: reply.commentId,
		},
		include: {
			user: true,
		},
	});
}

/**
 * [GET] gets the reply with the given id
 * @param replyId
 */
export async function getReply(replyId: number): Promise<ReplyLikedBy> {
	return prisma.reply.findUnique({
		where: {
			id: replyId,
		},
		include: {
			likedBy: true,
		},
	});
}

/**
 * [GET] gets the reply with the comment id
 * @param commentId
 */
export async function getRepliesByCommentId(commentId: number): Promise<Reply> {
	return prisma.reply.findMany({
		where: {
			commentId: commentId,
		},
	});
}

/**
 * [DELETE] deletes the reply with the given id
 * @param replyId
 */
export async function deleteReply(replyId: number): Promise<Reply> {
	return prisma.reply.delete({
		where: {
			id: replyId,
		},
	});
}

/**
 * [PUT] updates the content of a reply wth the id from the param to the content of the param
 * @param reply -  a custom data reply data to update the reply content
 */
export async function updateReply(reply: editReplyData): Promise<Reply> {
	return prisma.reply.update({
		where: {
			id: reply.id,
		},
		data: {
			content: reply.content,
			updatedAt: new Date(),
		},
	});
}
