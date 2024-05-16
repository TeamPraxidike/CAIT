import {getPublicationById, prisma} from "$lib/database";
import {Prisma} from "@prisma/client/extension";
import {PublicationType} from "@prisma/client";


/**
 * Gets the extensions needed for the frontend icons within the node cards
 * @param publicationId
 */
export async function fetchExtensions(publicationId: number){
    const publication = await getPublicationById(publicationId);
    if (!publication) {throw new Error("No publication found.");}

    if (publication.type === PublicationType.Circuit && publication.circuit) {return ["circuit"];}
    else if (publication.type === PublicationType.Material && publication.materials){
        const extensions: string[] = [];
        for (const file of publication.materials.files){
            extensions.push(file.path.split(".")[1]);
        }

        return extensions;
    }
}

export async function handleEdges(next: { fromId: number; toId: number[] }[],
                                  prismaContext: Prisma.TransactionClient = prisma){
    for (const edge of next){
        if (edge.fromId <= 0 || isNaN(edge.fromId)){
            throw new Error("Invalid id found");
        }
        await prismaContext.node.update({
            where: { id: edge.fromId },
            data: {
                next: {
                    connect: edge.toId.map(id => ({id}))
                }
            }
        });

        for (const to of edge.toId) {
            await prismaContext.node.update({
                where: { id: to },
                data: {
                    prerequisites: {
                        connect: {
                            id: edge.fromId
                        }
                    }
                }
            });
        }
    }
}


export async function addNode(circuitId: number, publicationId: number,
                              prismaContext: Prisma.TransactionClient = prisma) {

    const extensions = await fetchExtensions(publicationId);

    try{
        return prismaContext.node.create({
            data: {
                circuitId: circuitId,
                publicationId: publicationId,
                extensions: extensions
            }
        });
    } catch (error){
        throw new Error("Error while creating node");
    }
}

export async function editNode(nodeId: number, publicationId: number,
                               prismaContext: Prisma.TransactionClient = prisma) {

    const extensions = await fetchExtensions(publicationId);

    try{
        return prismaContext.node.update({
            where: {
                id: nodeId
            },
            data: {
                publicationId: publicationId,
                extensions: extensions
            }
        });
    } catch (error){
        throw new Error("Error while updating node");
    }
}

export async function deleteNode(nodeId: number, prismaContext: Prisma.TransactionClient = prisma) {
    try{
        return prismaContext.node.delete({
            where: {
                id: nodeId
            }
        });
    } catch (error){
        throw new Error("Error while deleting node");
    }
}
