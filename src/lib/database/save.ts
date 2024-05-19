import {prisma} from "$lib/database/prisma";

export async function savePublication(userId: number, publicationId: number) {
    const saved = await getSavedPublications(userId);
    if (saved === null) throw Error("Saved publications were not found");
    if(saved.saved.map(x => x.id).includes(publicationId)) {
        await unsave(userId, publicationId);
        return "Publication unsaved successfully";
        // return liked.liked
    } else {
        await save(userId, publicationId);
        return "Publication saved successfully"
    }
}

async function save(userId: number, publicationId: number) {
    await prisma.$transaction(async (prismaTransaction) => {
        await prismaTransaction.user.update({
            where: {
                id: userId
            },
            data: {
                saved: {
                    connect: {
                        id: publicationId
                    }
                }
            }
        });
    });
}


async function unsave(userId: number, publicationId: number) {
    await prisma.$transaction(async (prismaTransaction) => {
        await prismaTransaction.user.update({
            where: {
                id: userId
            },
            data: {
                saved: {
                    disconnect: {
                        id: publicationId
                    }
                }
            }
        });
    });
}

export async function getSavedPublications(userId: number) {
    return prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            saved: true
        }
    });
}