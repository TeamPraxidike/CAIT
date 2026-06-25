import { describe, it, expect, beforeEach } from 'vitest';
import { apiTestingUrl } from '../setup';
import { createUniqueUser } from '../../utility/users';
import { createUniqueMaterial, generateRandomString } from '../../utility/publicationsUtility';
import { createUniqueComment } from '../../utility/comment';
import { createReplyInputObject, createUniqueReply } from '../../utility/reply';
import { getRepliesByCommentId } from '../../../src/lib/database/reply';
import type { User } from '@prisma/client';

const json = (method: string, path: string, body?: unknown) =>
    fetch(`${apiTestingUrl}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(body !== undefined && { body: JSON.stringify(body) }),
    });

describe('REPLY API', () => {
    let user: User;
    let comment: { id: number };
    beforeEach(async () => {
        user = await createUniqueUser();
        const material = await createUniqueMaterial(user.id);
        comment = await createUniqueComment(user, material);
    });

    describe('/api/reply', () => {
        describe('POST', () => {
            it('should respond with 200 and persist the reply when creating a new reply', async () => {
                const content = generateRandomString();
                const response = await json('POST', '/reply', createReplyInputObject(user.id, comment.id, content));
                expect(response.status).toBe(200);
                expect(await response.json()).toMatchObject({ userId: user.id, commentId: comment.id, content });

                const stored = await getRepliesByCommentId(comment.id);
                expect(stored).toHaveLength(1);
                expect(stored[0]).toMatchObject({ userId: user.id, content });
            });
        });
    });

    describe('/api/reply/[replyId]', () => {
        let reply: { id: number; userId: string; content: string };
        beforeEach(async () => {
            reply = await createUniqueReply(user, comment);
        });

        describe('GET', () => {
            it('should retrieve the created reply with a 200 code', async () => {
                const response = await json('GET', `/reply/${reply.id}`);
                expect(response.status).toBe(200);
                expect(await response.json()).toMatchObject({
                    id: reply.id,
                    userId: reply.userId,
                    content: reply.content,
                });
            });

            it('should respond with 404 when retrieving a reply that does not exist', async () => {
                expect((await json('GET', '/reply/999999999')).status).toBe(404);
            });
        });

        describe('PUT', () => {
            it('should successfully edit an existing reply', async () => {
                const content = generateRandomString();
                const response = await json('PUT', `/reply/${reply.id}`, { replyId: reply.id, content });
                expect(response.status).toBe(200);
                expect(await response.json()).toMatchObject({ id: reply.id, userId: reply.userId, content });

                const getResponse = await json('GET', `/reply/${reply.id}`);
                expect((await getResponse.json()).content).toBe(content);
            });
        });

        describe('DELETE', () => {
            it('should delete the reply with a 200 and then 404 on retrieval', async () => {
                expect((await json('DELETE', `/reply/${reply.id}`)).status).toBe(200);
                expect((await json('GET', `/reply/${reply.id}`)).status).toBe(404);
            });
        });
    });
});
