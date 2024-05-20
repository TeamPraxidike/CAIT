import {prisma} from "$lib/database/prisma";

export async function addPublicationToUsedInCourse(userId: number, publicationId: number, course: string[]) {
    // use create many to create multiple records at once
    await prisma.publicationUsedInCourse.createMany({
        data: course.map(x => {
            return {
                userId: userId,
                publicationId: publicationId,
                course: x
            }
        })
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
    const courses = await prisma.publicationUsedInCourse.findMany({
        where: {
            userId: userId
        },
        select: {
            course: true
        }
    });
    return courses.map(x => x.course);
}