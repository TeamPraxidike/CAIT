import { createReply, type ReplyWithUser, type createReplyData } from '$lib/database/reply';
import { type User } from '$lib/database/user';
import { generateRandomString } from './publicationsUtility';
import { expect } from 'vitest';

export function createReplyInputObject(userId: string, commentId: number, content: string): createReplyData {
	return { userId, commentId, content };
}

export async function createUniqueReply(
	user: User,
	comment: { id: number },
	content = generateRandomString(),
): Promise<ReplyWithUser> {
	const reply = await createReply(createReplyInputObject(user.id, comment.id, content));
	expect(reply.userId).toBe(user.id);
	expect(reply.commentId).toBe(comment.id);
	expect(reply.content).toBe(content);
	return reply;
}
