
import { type Level, Prisma } from '@prisma/client';
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
