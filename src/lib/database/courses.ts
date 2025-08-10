
import { type Level, Prisma, type PrismaClient } from '@prisma/client';
import { prisma } from '$lib/database/prisma';

export type createCourseData = {
	learningObjectives: string[];
	prerequisites: string[];
	educationalLevel: Level;
	courseName: string;
	creatorId: string;
}

export type Course = Prisma.CourseGetPayload<true>;

export async function createCourse(course: createCourseData): Promise<Course> {
	return prisma.course.create({
		data: {
			learningObjectives: course.learningObjectives,
			prerequisites: course.prerequisites,
			educationalLevel: course.educationalLevel,
			courseName: course.courseName,
			maintainers: {
				connect: [{ id: course.creatorId }]
			}
		}
	});
}

export async function findCourseByName(courseName: string): Promise<Course> {
	return prisma.course.findFirst({
		where: {
			courseName: courseName
		}
	});
}

export async function findCourseByMantainer(userId: string): Promise<Course[]> {
	return prisma.course.findMany({
		where: {
			maintainers: {
				some: {
					id: userId
				}
			}
		}
	});
}

export async function getAllCourses(): Promise<Course[]> {
	return prisma.course.findMany();
}

export async function linkCourseToPublication(publicationId: number, courseId: number, prismaTransaction: Prisma.TransactionClient = prisma) {
	if (!courseId) return;

	const publication = await prismaTransaction.publication.findUnique({
		where: { id: publicationId }
	});

	if (!publication) {
		throw new Error(`Publication with ID ${publicationId} not found.`);
	}

	return prismaTransaction.publication.update({
		where: { id: publicationId },
		data: {
			course: {
				connect: { id: courseId }
			}
		}
	});
}

export async function removeCourseFromPublication(publicationID: number) {
	await prisma.publication.update({
		where: {
			id: publicationID
		},
		data: {
			courseId: null
		}
	})
}

export async function removeCourseFromPublications(courseId: number) {
	await prisma.publication.updateMany({
		where: {
			courseId: courseId
		},
		data: {
			courseId: null
		}
	});
}

export async function deleteCourse(courseId: number): Promise<Course> {
	return prisma.$transaction(async (prismaTransaction: PrismaClient) => {
		await removeCourseFromPublications(courseId);
		return prismaTransaction.course.delete({
			where: {
				id: courseId
			}
		});
	});
}
