import {Prisma} from "@prisma/client/extension";
import {prisma} from "$lib/database/prisma";

export async function handleSimilarity(
    comparisons: {fromPubId: number, toPubId: number, similarity: number}[],
    prismaContext: Prisma.TransactionClient = prisma,
) {
    // handle one way of connection
    await prismaContext.similarContent.upsert({
        data: comparisons,
        skipDuplicates: true
    });

    // switch connections
    comparisons = comparisons.map(data => ({
        fromPubId: data.toPubId,
        toPubId: data.fromPubId,
        similarity: data.similarity
    }))

    // handle other way of connection
    await prismaContext.similarContent.upsert({
        data: comparisons,
        skipDuplicates: true
    });
}