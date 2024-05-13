import {prisma} from "$lib/database";

/**
 * Returns a publication of type Circuit with the given id.
 * @param publicationId - id of publication linked to circuit
 */
export async function getCircuitByPublicationId(publicationId: number) {
    return prisma.circuit.findUnique({
        where: { publicationId: publicationId },
        include: {
            publication: true,
            nodes: true
        }
    });
}

/**
 * Returns the all publications of type Circuit in the database
 */
export async function getAllCircuits() {
    return prisma.circuit.findMany({
        include: {
            publication: true,
            nodes: false
        }
    });
}