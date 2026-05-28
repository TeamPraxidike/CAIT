import { createComment, type CommentWithRepliesAndUsers, type createCommentData, type FullComment } from "$lib/database/comment";
import { type User } from '$lib/database/user';
import type { MaterialWithPublicationNoFiles } from "$lib/database/material";
import { generateRandomString } from "./publicationsUtility";
import { expect } from "vitest";



export function createCommentInputObject(userId:string, publicationId:number, content:string): createCommentData {
    return {
        userId: userId,
        publicationId: publicationId,
        content: content
    }
}

function generateRandomContent():string{
    return generateRandomString()
}


async function newComment(commentInput:createCommentData): Promise<CommentWithRepliesAndUsers>{
    const comment = await createComment(commentInput);
    expect(comment.userId).toBe(commentInput.userId);
    expect(comment.publicationId).toBe(commentInput.publicationId);
    expect(comment.content).toBe(commentInput.content);
    return comment;
}

export async function createUniqueComment(user:User, publication:MaterialWithPublicationNoFiles, content=generateRandomContent()): Promise<CommentWithRepliesAndUsers> {
    const commentInput = createCommentInputObject(user.id, publication.publicationId, content);
    return await newComment(commentInput);
}