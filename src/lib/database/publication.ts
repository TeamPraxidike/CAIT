import {Prisma} from "@prisma/client/extension";
import {prisma} from "$lib/database/prisma";

////////////////////////////////////////////////
//   HELPER METHODS (parsing)
////////////////////////////////////////////////

export async function connectMaintainers(publicationId: number, maintainerConnect: string[],
                                  prismaContext: Prisma.TransactionClient = prisma): Promise<void> {
    // ids of users to connect as maintainers
    const maintainerConParsed = maintainerConnect.map((number: string) => {
        const parsed = parseInt(number);
        if (isNaN(parsed)) {
            throw new Error(`Invalid number in maintainer connect: ${number}`);
        }
        return parsed;
    });

    await updatePublicationConnectMaintainers(publicationId, maintainerConParsed, prismaContext);
}

export async function disconnectMaintainers(publicationId: number, maintainerDisconnect: string[],
                                     prismaContext: Prisma.TransactionClient = prisma): Promise<void> {
// ids of users to disconnect as maintainers
    const maintainerDisParsed = maintainerDisconnect.map((number: string) => {
        const parsed = parseInt(number);
        if (isNaN(parsed)) {
            throw new Error(`Invalid number in maintainer disconnect: ${number}`);
        }
        return parsed;
    });

    await updatePublicationDisconnectMaintainers(publicationId, maintainerDisParsed, prismaContext);
}

export async function connectTags(publicationId: number, tagConnect: string[],
                           prismaContext: Prisma.TransactionClient = prisma): Promise<void> {
// ids of tags to connect
    const tagConnectParsed = tagConnect.map((number: string) => {
        const parsed = parseInt(number);
        if (isNaN(parsed)) {
            throw new Error(`Invalid number in tag connect: ${number}`);
        }
        return parsed;
    });

    await updatePublicationConnectTags(publicationId, tagConnectParsed, prismaContext);
}

export async function disconnectTags(publicationId: number, tagDisconnect: string[],
                              prismaContext: Prisma.TransactionClient = prisma): Promise<void> {
// ids of tags to disconnect
    const tagDisconnectParsed = tagDisconnect.map((number: string) => {
        const parsed = parseInt(number, 10);
        if (isNaN(parsed)) {
            throw new Error(`Invalid number in tag disconnect: ${number}`);
        }
        return parsed;
    });

    await updatePublicationDisconnectTags(publicationId, tagDisconnectParsed, prismaContext);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////


export async function updatePublicationConnectMaintainers(publicationId: number, maintainerConnect: number[],
                                                          prismaContext: Prisma.TransactionClient = prisma) {
    return prismaContext.publication.update({
        where: { id: publicationId },
        data: {
            maintainers: {
                connect: maintainerConnect.map(id => ({ id })),
            }
        }
    });
}

export async function updatePublicationDisconnectMaintainers(publicationId: number, maintainerDisconnect: number[],
                                                             prismaContext: Prisma.TransactionClient = prisma) {
    return prismaContext.publication.update({
        where: { id: publicationId },
        data: {
            maintainers: {
                disconnect: maintainerDisconnect.map(id => ({ id })),
            }
        }
    });
}

export async function updatePublicationConnectTags(publicationId: number, tagConnect: number[],
                                                   prismaContext: Prisma.TransactionClient = prisma) {
    return prismaContext.publication.update({
        where: { id: publicationId },
        data: {
            tags: {
                connect: tagConnect.map(id => ({ id })),
            }
        }
    });
}

export async function updatePublicationDisconnectTags(publicationId: number,tagDisconnect: number[],
                                                      prismaContext: Prisma.TransactionClient = prisma) {
    return prismaContext.publication.update({
        where: { id: publicationId },
        data: {
            tags: {
                disconnect: tagDisconnect.map(id => ({ id })),
            }
        }
    });
}