
import { type Level, Prisma, type PrismaClient } from '@prisma/client';
import { prisma } from '$lib/database/prisma';
import type { UserWithProfilePic } from '$lib/util/coursesLogic';
import { coverPicFetcher, profilePicFetcher } from '$lib/database/file';
import type { FetchedFileItem } from '$lib/database/index';

export type createCourseData = {
	learningObjectives: string[];
	prerequisites: string[];
	educationalLevel: Level;
	courseName: string;
	creatorId: string;
	maintainers: string[];
	copyright: string;
	coverPic: {
		type: string;
		info: string;
	} | null;
}

export type CourseWithMaintainersAndProfilePic = Course & {
	maintainers: UserWithProfilePic[];
};

export type Course = Prisma.CourseGetPayload<{
	include: {
		coverPic: true
	}
}>;

export type CourseWithCoverPic = Prisma.CourseGetPayload<true> & {
	coverPic: FetchedFileItem;
	maintainers: UserWithProfilePic[];
};


async function enrichMaintainers(course: Course & { maintainers: any[] }): Promise<CourseWithMaintainersAndProfilePic> {
	const enrichedMaintainers: UserWithProfilePic[] = await Promise.all(
		course.maintainers.map(async (user) => ({
			...user,
			profilePicData: (await profilePicFetcher(user.profilePic)).data,
		}))
	);

	return {
		...course,
		maintainers: enrichedMaintainers,
	};
}

export async function getAllCoursesExtended(): Promise<CourseWithMaintainersAndProfilePic[]> {
	const courses = await prisma.course.findMany({
		include: {
			maintainers: {
				include: { profilePic: true }
			},
			coverPic: true
		}
	});

	return Promise.all(courses.map(enrichMaintainers));
}

export async function getCourseByIdExtended(courseId: number): Promise<CourseWithCoverPic> {
	let course = await prisma.course.findUnique({
		where: { id: courseId },
		include: {
			maintainers: {
				include: { profilePic: true }
			},
			coverPic: true
		}
	});

	// course = await enrichMaintainers(course)
	const coverPic = await coverPicFetcher(null, course.coverPic);
	return { ...course, coverPic }
}


export async function createCourse(course: createCourseData): Promise<Course> {
	return prisma.course.create({
		data: {
			learningObjectives: course.learningObjectives,
			prerequisites: course.prerequisites,
			educationalLevel: course.educationalLevel,
			courseName: course.courseName,
			copyright: course.copyright,
			maintainers: {
				connect: [{ id: course.creatorId }, ...course.maintainers.map(x => ({ id: x }))]
			}
		}
	});
}

export type updateCourseData = {
    id: number;
    courseName: string;
    educationalLevel: Level;
    learningObjectives: string[];
    prerequisites: string[];
    maintainers: string[]; // user ids (excluding current user is allowed)
    currentUserId: string; // ensure current user remains a maintainer
	copyright: string;
}

export async function updateCourse(data: updateCourseData): Promise<Course> {
    const uniqueMaintainerIds = Array.from(new Set([data.currentUserId, ...data.maintainers]));

    return prisma.course.update({
        where: { id: data.id },
        data: {
            courseName: data.courseName,
            educationalLevel: data.educationalLevel,
            learningObjectives: data.learningObjectives,
            prerequisites: data.prerequisites,
			copyright: data.copyright || '',

            maintainers: {
                set: uniqueMaintainerIds.map((id) => ({ id }))
            }
        }
    });
}

export async function findCourseByNameExtended(courseName: string): Promise<CourseWithMaintainersAndProfilePic | null> {
	const course = await prisma.course.findFirst({
		where: { courseName },
		include: {
			maintainers: {
				include: { profilePic: true }
			}
		}
	});

	if (!course) return null;
	return enrichMaintainers(course);
}


export async function findCourseByMantainerExtended(userId: string): Promise<CourseWithMaintainersAndProfilePic[]> {
	const courses = await prisma.course.findMany({
		where: {
			maintainers: {
				some: { id: userId }
			}
		},
		include: {
			maintainers: {
				include: { profilePic: true }
			},
			coverPic: true
		}
	});

	return Promise.all(courses.map(enrichMaintainers));
}

// export async function getAllCourses(): Promise<Course[]> {
// 	return prisma.course.findMany();
// }

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

