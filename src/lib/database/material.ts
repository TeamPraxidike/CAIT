import {prisma} from "$lib/database";

/**
 * Returns a publication of type Material with the given id.
 * @param publicationId - id of publication linked to material
 */
export async function getMaterialByPublicationId(publicationId: number) {
    return prisma.material.findUnique({
        where: { publicationId: publicationId },
        include: {
            publication: true,
            files: true
        }
    });
}

/**
 * Returns the all publications of type Material in the database
 */
export async function getAllMaterials() {
    return prisma.material.findMany({
        include: {
            publication: true,
            files: false
        }
    });
}