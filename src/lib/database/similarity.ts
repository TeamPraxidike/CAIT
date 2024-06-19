import {Prisma} from "@prisma/client/extension";
import {prisma} from "$lib/database/prisma";

export async function handleSimilarity(
    comparisons: {fromPubId: number, toPubId: number, similarity: number}[],
    prismaContext: Prisma.TransactionClient = prisma,
) {
    // Handle one way of connection
    await Promise.all(comparisons.map(data =>
        prismaContext.similarContent.upsert({
            where: {
                similarFromId_similarToId: {
                    similarFromId: data.fromPubId,
                    similarToId: data.toPubId
                }
            },
            create: {
                similarFromId: data.fromPubId,
                similarToId: data.toPubId,
                similarity: data.similarity
            },
            update: {
                similarity: data.similarity
            }
        })
    ));

    // Switch connections
    const switchedComparisons = comparisons.map(data => ({
        fromPubId: data.toPubId,
        toPubId: data.fromPubId,
        similarity: data.similarity
    }));

    // Handle other way of connection
    await Promise.all(switchedComparisons.map(data =>
        prismaContext.similarContent.upsert({
            where: {
                similarFromId_similarToId: {
                    similarFromId: data.fromPubId,
                    similarToId: data.toPubId
                }
            },
            create: {
                similarFromId: data.fromPubId,
                similarToId: data.toPubId,
                similarity: data.similarity
            },
            update: {
                similarity: data.similarity
            }
        })
    ));
}

export async function getSimilarPublications(
    publicationId: number
) {
    return prisma.similarContent.findMany({
        where: {
            similarFromId: publicationId,
            similarity: {
                gte: 0.4,
            },
        },
        orderBy: {
            similarity: 'desc',
        },
        include: {
            similarTo: {
                include: {
                    tags: true,
                    coverPic: true,
                    materials: true,
                    circuit: true,
                    usedInCourse: {
                        select: {
                            course: true,
                        },
                    },
                    publisher: {
                        include: {
                            profilePic: true,
                        },
                    },
                },
            },
        }
    });
}