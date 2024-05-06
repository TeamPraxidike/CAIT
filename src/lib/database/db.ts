import { Difficulty } from '@prisma/client';
import { PublicationType } from '@prisma/client';
import { MaterialType } from '@prisma/client';

import {prisma} from "$lib/database";
/**
 * Adds a new user to the database. Sets his reputation to 0.
 * @param firstName
 * @param lastName
 * @param email
 * @param isAdmin
 */
export async function createUser(firstName: string, lastName: string, email: string, isAdmin: boolean) {
    return prisma.user.create({
        data: {
            firstName: firstName,
            lastName: lastName,
            email: email,
            reputation: 0,
            isAdmin: isAdmin,
        },
    });
}

/**
 * Returns the user with the given id.
 * @param id
 */
export async function getUserById(id: number) {
    const user = await prisma.user.findUnique({
        where: {
            id: id
        },
    });
    console.log('User:', user);
    return user;
}

/**
 * Creates a new publication with the given data. Sets the likes to 0.
 * @param title
 * @param description
 * @param difficulty
 * @param publisherId
 * @param type
 */
async function createPublication(
    title: string,
    description: string,
    difficulty: Difficulty,
    publisherId: number,
    type: PublicationType
) {
    return prisma.publication.create({
        data: {
            title: title,
            description: description,
            likes: 0,
            difficulty: difficulty,
            publisherId: publisherId,
            type: type,
        },
    });
}

/**
 * Creates a new publication of type Material with the given data. Sets the likes to 0.
 * @param materialData This is an object that contains the id of the user who created the material,
 * the title, the description, the difficulty, the time estimate,
 * the theory to practice ratio, the files and the type of the material (dataset, assignment, etc.).
 */
export async function createMaterialPublication(
    materialData: {
        userId: number, // TODO may be better to be the user, dont know how to specify type then
        title: string,
        description: string,
        copyright: boolean,
        difficulty: Difficulty, // TODO figure out how to make people using this not import Difficulty type from prisma
        timeEstimate: number,
        theoryPractice: number,
        files: string[]
        type: MaterialType
    }
) {

    // Step 1: Create the Publication
    const publication = await createPublication(
        materialData.title,
        materialData.description,
        materialData.difficulty,
        materialData.userId,
        PublicationType.Material
    );

    // Step 2: Create the Material and link it to the Publication
    return prisma.material.create({
        data: {
            publicationId: publication.id,
            timeEstimate: materialData.timeEstimate,
            theoryPractice: materialData.theoryPractice,
            files: materialData.files,
            copyright: materialData.copyright,
            type: materialData.type
        },
    });
}

/**
 * Creates a new publication of type Circuit with the given data.
 * @param circuitData This is an object that contains the id of the user who created the circuit,
 * the title, the description and the difficulty
 */
export async function createCircuitPublication(
    circuitData: {
        userId: number, // may have to be the user, dont know how to specify type then
        title: string,
        description: string,
        copyright: boolean,
        difficulty: Difficulty
    }
) {
    const publication = await createPublication(
        circuitData.title,
        circuitData.description,
        circuitData.difficulty,
        circuitData.userId,
        PublicationType.Circuit
    );

    return prisma.circuit.create({
        data: {
            publicationId: publication.id,
        },
    });
}

/**
 * Returns the publication with the given id. Gives no guarantee for the type of the publication.
 * @param id
 */
export async function getPublicationById(id: number) {
    return prisma.publication.findUnique({
        where: {
            id: id
        },
    });
}

// TODO I dont know if this replaces the whole array of nodes or just adds the new one
/**
 * Adds a node to the circuit with the given publicationId.
 * Throws an error if the publication is not found or if it is not a circuit.
 * @param publicationId
 * @param nodeId
 */
export async function addNodeToCircuit(publicationId: number, nodeId: number) {
    const publication = await getPublicationById(publicationId);
    if(publication === null) throw new Error('Publication not found');
    if(publication.type !== PublicationType.Circuit) throw new Error('Publication is not a circuit');

    return prisma.circuit.update({
        where: {
            publicationId: publicationId
        },
        data: {
            nodes: {
                connect: {
                    id: nodeId
                }
            }
        }
    });
}