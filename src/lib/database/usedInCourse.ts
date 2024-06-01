import {prisma} from "$lib/database/prisma";

/**
 * Replaces ALL courses that a user is using a publication in with the new courses send to this function
 * @param userId
 * @param publicationId
 * @param courses
 */
export async function addPublicationToUsedInCourse(userId: number, publicationId: number, courses: string[]) {
    await prisma.publicationUsedInCourse.deleteMany({
        where: {
            userId: userId,
            publicationId: publicationId,
        },
    });

    await prisma.publicationUsedInCourse.createMany({
        data: courses.map(x => {
            return {
                userId: userId,
                publicationId: publicationId,
                course: x
            }
        })
    });
}

/**
 * Get all courses that use a publication
 * @param publicationId
 */
export async function coursesUsingPublication(publicationId: number) {
    const courses = await prisma.publicationUsedInCourse.findMany({
        where: {
            publicationId: publicationId
        },
        select: {
            course: true
        }
    });
    return courses.map(x => x.course);
}

/**
 * Get all publications a user uses
 * @param userId
 */
export async function publicationsAUserUses(userId: number) {
    const publications = await prisma.publicationUsedInCourse.findMany({
        where: {
            userId: userId
        },
        select: {
            publicationId: true
        }
    });
    const publId = publications.map(x => x.publicationId);
    return prisma.publication.findMany({
        where: {
            id: {
                in: publId
            }
        }
    });
}

