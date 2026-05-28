import { describe, it, expect, beforeEach } from 'vitest';
import { apiTestingUrl } from '../setup';
import { createUniqueUser, createUserInputObject } from '../../utility/users';
import { createUniqueMaterial, generateRandomString } from '../../utility/publicationsUtility';
import type { User } from '@prisma/client';
import type { MaterialWithPublicationNoFiles } from '$lib/database/material';
import { createCommentInputObject, createUniqueComment } from '../../utility/comment';
import { getCommentsByPublicationId, type CommentWithRepliesAndLiked } from '../../../src/lib/database/comment';
import { uuid } from '@supabase/supabase-js/dist/main/lib/helpers';

describe('COMMENT API', () => {
    describe('/api/comment', () =>{
        let user:User;
        let material: MaterialWithPublicationNoFiles;
        beforeEach(async () => {
            user = await createUniqueUser();
            expect(user).toBeDefined();
            material = await createUniqueMaterial(user.id);
            expect(material).toBeDefined();
            // let comment = createc
        })


        describe('POST', () => {
            it('should respond with 200 when creating a new comment', async () => {
                let randomContent = generateRandomString();
                const commentInput = createCommentInputObject(user.id, material.publicationId, randomContent);
                let response = await fetch(`${apiTestingUrl}/comment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(commentInput),
                });
                expect(response.status).toBe(200);
                const comment = (await response.json());
                const compareComment = await getCommentsByPublicationId(comment.publicationId);
                expect(compareComment.length).toBeGreaterThan(0);
                expect(compareComment[0]).toHaveProperty(
                    'userId',
                    user.id
                )
                expect(compareComment[0]).toHaveProperty(
                    'publicationId',
                    material.publicationId
                )
                expect(compareComment[0]).toHaveProperty(
                    'content',
                    randomContent
                )
            });

            it('should respond with a 413 "Payload Too Large" error when sending unrealistically large amounts of text', async () => {
                let randomContent = generateRandomString(10000);
                const commentInput = createCommentInputObject(user.id, material.publicationId, randomContent);
                let response = await fetch(`${apiTestingUrl}/comment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(commentInput),
                });
                expect(response.status).toBe(413);

            });

            it('should respond with 404 when the user has been deleted', async () => {
			    const deleteResponse = await fetch(
				    `${apiTestingUrl}/user/${user.id}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
			    );
			    expect(deleteResponse.status).toBe(200);

                let randomContent = generateRandomString();
                const commentInput = createCommentInputObject(user.id, material.publicationId, randomContent);
                let response = await fetch(`${apiTestingUrl}/comment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(commentInput),
                });
                expect(response.status).toBe(404);
            })

            it('should respond with 404 when the user does not exist', async () => {
                let randomContent = generateRandomString();
                const commentInput = createCommentInputObject('no-way-this-gets-chosen-randomly', material.publicationId, randomContent);
                let response = await fetch(`${apiTestingUrl}/comment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(commentInput),
                });
                expect(response.status).toBe(404);
            })


            it('should respond with 404 when the publication has been deleted', async () => {
			    const deleteResponse = await fetch(
				    `${apiTestingUrl}/material/${material.publicationId}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
			    );
			    expect(deleteResponse.status).toBe(200);

                let randomContent = generateRandomString();
                const commentInput = createCommentInputObject(user.id, material.publicationId, randomContent);
                let response = await fetch(`${apiTestingUrl}/comment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(commentInput),
                });
                expect(response.status).toBe(404);
            })

            it('should respond with 404 when the publication does not exist', async () => {
                let randomContent = generateRandomString();
                const commentInput = createCommentInputObject(user.id, -1, randomContent);
                let response = await fetch(`${apiTestingUrl}/comment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(commentInput),
                });
                expect(response.status).toBe(404);
            })
        });
    });

    describe('/api/comment/[commentid]', () =>{

        let user:User;
        let material: MaterialWithPublicationNoFiles;
        let comment:CommentWithRepliesAndLiked;
        beforeEach(async () => {
            user = await createUniqueUser();
            expect(user).toBeDefined();
            material = await createUniqueMaterial(user.id);
            expect(material).toBeDefined();
            let randomContent = generateRandomString();
            const commentInput = createCommentInputObject(user.id, material.publicationId, randomContent);
            let response = await fetch(`${apiTestingUrl}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(commentInput),
            });
            expect(response.status).toBe(200);
            comment = (await response.json());
        });

        describe('GET', () => {
            it("should retrieve the created comment with a 200 code", async () => {
                let getResponse = await fetch(`${apiTestingUrl}/comment/${comment.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                expect(getResponse.status).toBe(200);
                let responseComment = (await getResponse.json());

                expect(responseComment.id).toBe(comment.id);
                expect(responseComment.userId).toBe(comment.userId);
                expect(responseComment.content).toBe(comment.content);
            })
            it("should respond with 404 when retrieving a comment that does not exist", async () => {
                const nonExistingCommentId = uuid();

                const getResponse = await fetch(`${apiTestingUrl}/comment/${nonExistingCommentId}`, {
                    method: "GET", // use "GET" if your endpoint retrieves with GET
                    headers: {
                    "Content-Type": "application/json",
                    },
                });

                expect(getResponse.status).toBe(404);
            });

        });

        describe('DELETE', () => {
            it("should delete the created comment with a 200 and then 404", async () => {
                let delResponse = await fetch(`${apiTestingUrl}/comment/${comment.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                expect(delResponse.status).toBe(200);

                let getResponse = await fetch(`${apiTestingUrl}/comment/${comment.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                expect(getResponse.status).toBe(404);
            })

            it("should 404 when deleting non existing comments", async () => {
                const nonExistingCommentId = uuid();

                let delResponse = await fetch(`${apiTestingUrl}/comment/${nonExistingCommentId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                expect(delResponse.status).toBe(404);
            })
            
        });

        describe('PUT', () => {
            it('should succesfully edit already existing comments', async () => {
                const newComment = await createUniqueComment(user, material);

                const editComment = { metaData: { ...createCommentInputObject(newComment.user.id, newComment.publicationId, newComment.content),  } };
                const resp = await fetch(`${apiTestingUrl}/comment/${comment.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
				    body: JSON.stringify(editComment),
			    });
                const newcomment = await resp.json();
                expect(resp.status).toBe(200);
                expect(newcomment).toHaveProperty("id", comment.id);
                expect(newcomment).toHaveProperty("userId", comment.userId);
                expect(newcomment).toHaveProperty("publicationId", comment.publicationId);
                expect(newcomment).toHaveProperty("content", comment.content);

            });

            it('should fail gracefull when editing non-existing comments', async () => {
                let delResponse = await fetch(`${apiTestingUrl}/comment/${comment.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                expect(delResponse.status).toBe(200);
                
                
                const newComment = await createUniqueComment(user, material);

                const editComment = { metaData: { ...createCommentInputObject(newComment.user.id, newComment.publicationId, newComment.content),  } };
                const resp = await fetch(`${apiTestingUrl}/comment/${comment.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
				    body: JSON.stringify(editComment),
			    });
                expect(resp.status).toBe(400);
            });

        });
    });

    describe('/api/comment/publication', () =>{
        describe('GET', () => {

        });

        describe('POST', () => {
            
        });
    });

    describe('/api/comment/publication/[publicationId]', () =>{
        describe('GET', () => {

        });

        describe('POST', () => {
            
        });
    });
});


