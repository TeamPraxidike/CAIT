import { Prisma } from '@prisma/client';
import {prisma} from "$lib/database/prisma";

export type SimilarPublicationsResult = Prisma.SimilarContentGetPayload<{
    include: {
        similarTo: {
            include: {
                tags: true,
                coverPic: true,
                materials: true,
                circuit: true,
                publisher: {
                    include: {
                        profilePic: true,
                    },
                },
            },
        },
    }
}>;

export async function handleSimilarity(
    comparisons: {fromPubId: number, toPubId: number, similarity: number}[],
    prismaContext: Prisma.TransactionClient = prisma,
) {
    const validComparisons = comparisons.filter(({ fromPubId, toPubId, similarity }) =>
        Number.isInteger(fromPubId) &&
        Number.isInteger(toPubId) &&
        fromPubId > 0 &&
        toPubId > 0 &&
        fromPubId !== toPubId &&
        Number.isFinite(similarity)
    );

    // Handle one way of connection
    await Promise.all(validComparisons.map(data =>
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
    const switchedComparisons = validComparisons.map(data => ({
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
): Promise<SimilarPublicationsResult[]> {
    return prisma.similarContent.findMany({
        where: {
            similarFromId: publicationId,
            similarity: {
                gte: 0.4,
            },
            similarTo: {
				isDraft: false,
				archivedAt: null,
            }
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
