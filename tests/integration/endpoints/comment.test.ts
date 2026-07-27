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
                const delResponse = await fetch(`${apiTestingUrl}/comment/${comment.id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                });
                expect(delResponse.status).toBe(200);

                const getResponse = await fetch(`${apiTestingUrl}/comment/${comment.id}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
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
                const delResponseFirst = await fetch(`${apiTestingUrl}/comment/${comment.id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                });
                expect(delResponseFirst.status).toBe(200);

                const delResponseSecond = await fetch(`${apiTestingUrl}/comment/${comment.id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                });
                expect(delResponseSecond.status).toBe(404);
            })
            
        });

        describe('PUT', () => {
            it('should succesfully edit already existing comments', async () => {
                // const newComment = await createUniqueComment(user, material);

                let newContent = generateRandomString();
                // const editComment = { metaData: { ...createCommentInputObject(newComment.user.id, newComment.publicationId, newComment.content),  } };
                const editComment = { content: newContent, commentId: comment.id}
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
                expect(newcomment).toHaveProperty("content", newContent);

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
                expect(responseComment.content).toBe(newContent);

            });

            it('should make sure the commentid in the body equals commentid in the params', async () => {
                let newContent = generateRandomString();
                const editComment = { content: newContent, commentId: comment.id + 1}
                const resp = await fetch(`${apiTestingUrl}/comment/${comment.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
				    body: JSON.stringify(editComment),
			    });
                const newcomment = await resp.json();
                expect(resp.status).toBe(409);
            })

            it('should fail gracefull when editing non-existing comments', async () => {
                let delResponse = await fetch(`${apiTestingUrl}/comment/${comment.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                expect(delResponse.status).toBe(200);
                
                let newContent = generateRandomString();

                const editComment = { content: newContent, commentId: comment.id};
                const resp = await fetch(`${apiTestingUrl}/comment/${comment.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
				    body: JSON.stringify(editComment),
			    });
                expect(resp.status).toBe(404);
            });

        });
    });

    // describe('/api/comment/publication', () =>{
    //     describe('GET', () => {
    //         it("should 404 since this is not an endpoint", async () => {
    //             const resp = await fetch(`${apiTestingUrl}/comment/publication`, {
    //                 method: 'GET',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
	// 		    });
    //             expect(resp.status).toBe(404);
    //         })
    //     });
    // });

    describe('/api/comment/publication/[publicationId]', () =>{
        let user:User;
        let material: MaterialWithPublicationNoFiles;
        let comment:CommentWithRepliesAndLiked;
        let randomContent:string;
        beforeEach(async () => {
            user = await createUniqueUser();
            expect(user).toBeDefined();
            material = await createUniqueMaterial(user.id);
            expect(material).toBeDefined();
            randomContent = generateRandomString();
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
            it("should retrieve the comments with code 200", async () => {
                const resp = await fetch(`${apiTestingUrl}/comment/publication/${material.publicationId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
			    });
                expect(resp.status).toBe(200);
                let comments = await resp.json();
                expect(comments).toHaveLength(1);
                
                expect(comments[0]).toHaveProperty(
                    'userId',
                    user.id
                )
                expect(comments[0]).toHaveProperty(
                    'publicationId',
                    material.publicationId
                )
                expect(comments[0]).toHaveProperty(
                    'content',
                    randomContent
                )
            })

            it("should 404 when retrieving non-existend publications", async () => {
                const resp = await fetch(`${apiTestingUrl}/comment/publication/${material.publicationId+100000000000}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
			    });
                
                expect(resp.status).toBe(404);

            });

            it("should 200 and return an empty list if a publication has no comments", async () => {
                
                let material2 = await createUniqueMaterial(user.id);
                const resp = await fetch(`${apiTestingUrl}/comment/publication/${material2.publicationId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
			    });
                expect(resp.status).toBe(200);
                let comments = await resp.json();
                expect(comments).toHaveLength(0);
            })
        });
    });
});


