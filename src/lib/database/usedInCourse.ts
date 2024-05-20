import {prisma} from "$lib/database/prisma";

export async function addPublicationToUsedInCourse(userId: number, publicationId: number, courses: string[]) {
    // use create many to create multiple records at once
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

export async function removeFromUsedInCourse(publicationId: number, courses: string[]) {
    return prisma.publicationUsedInCourse.deleteMany({
        where: {
            publicationId: publicationId,
            course: {
                in: courses
            }
        }
    });
}

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