
import { type CourseEventType, Prisma } from '@prisma/client';
import { prisma } from '$lib/database/prisma';
import type { UserWithProfilePic } from '$lib/util/coursesLogic';
import { coverPicFetcher, profilePicFetcher } from '$lib/database/file';
import type { FetchedFileItem } from '$lib/database/index';
import { sensitive_fields_user } from '$lib/util/sensitive_fields.ts';

export type createCourseData = {
	learningObjectives: string[];
	prerequisites: string[];
	educationalLevel: string;
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
		coverPic: true,
		publications: true
	}
}>;

export type CourseWithCoverPic = Prisma.CourseGetPayload<true> & {
	coverPic: FetchedFileItem;
	maintainers: UserWithProfilePic[];
};

export type ArchivedCourse = Prisma.CourseGetPayload<{
	include: {
		maintainers: {
			select: {
				id: true;
				firstName: true;
				lastName: true;
				username: true;
			};
		};
		coverPic: true;
		publications: {
			select: {
				id: true;
				title: true;
				archivedAt: true;
			};
		};
	};
}>;


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

export async function getAllCoursesExtended(return_sensitive_fields=true): Promise<CourseWithMaintainersAndProfilePic[]> {
	const courses = await prisma.course.findMany({
		where: { archivedAt: null },
		include: {
			maintainers: {
				...sensitive_fields_user(return_sensitive_fields)
			},
			coverPic: true,
			publications: {
				where: { archivedAt: null },
			},
		}
	});

	return Promise.all(courses.map(enrichMaintainers));
}

export async function getCourseByIdExtended(courseId: number): Promise<CourseWithCoverPic> {
	const course = await prisma.course.findFirst({
		where: { id: courseId, archivedAt: null },
		include: {
			maintainers: {
				include: { profilePic: true }
			},
			coverPic: true
		}
	});
	if (!course) throw new Error(`Course with ID ${courseId} not found.`);

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
	educationalLevel: string;
	learningObjectives: string[];
	prerequisites: string[];
	maintainers: string[]; // user ids (excluding current user is allowed)
	currentUserId: string; // ensure current user remains a maintainer
	copyright: string;
}

export async function updateCourse(data: updateCourseData): Promise<Course> {
	const uniqueMaintainerIds = Array.from(new Set([data.currentUserId, ...data.maintainers]));
	const existing = await prisma.course.findFirst({
		where: { id: data.id, archivedAt: null },
		select: { id: true },
	});
	if (!existing) throw new Error(`Course with ID ${data.id} not found.`);

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
		where: { courseName, archivedAt: null },
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
			archivedAt: null,
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

	const [publication, course] = await Promise.all([
		prismaTransaction.publication.findFirst({
			where: { id: publicationId, archivedAt: null }
		}),
		prismaTransaction.course.findFirst({
			where: { id: courseId, archivedAt: null },
			select: { id: true },
		}),
	]);

	if (!publication) {
		throw new Error(`Publication with ID ${publicationId} not found.`);
	}
	if (!course) {
		throw new Error(`Course with ID ${courseId} not found.`);
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

export async function archiveCourse(
	courseId: number,
	actorId: string,
	reason: string | null = null,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	const existing = await prismaContext.course.findUnique({
		where: { id: courseId },
		select: { id: true, archivedAt: true },
	});
	if (!existing) return null;
	if (existing.archivedAt) return prismaContext.course.findUnique({ where: { id: courseId } });

	const course = await prismaContext.course.update({
		where: { id: courseId },
		data: {
			archivedAt: new Date(),
			archivedById: actorId,
			archiveReason: reason,
		},
	});

	await prismaContext.courseHistory.create({
		data: {
			action: 'ARCHIVE' as CourseEventType,
			courseId,
			userId: actorId,
			comment: reason,
		},
	});

	return course;
}

export async function restoreCourse(
	courseId: number,
	actorId: string,
	comment: string | null = null,
	prismaContext: Prisma.TransactionClient = prisma,
) {
	const existing = await prismaContext.course.findUnique({
		where: { id: courseId },
		select: { id: true, archivedAt: true },
	});
	if (!existing) return null;
	if (!existing.archivedAt) return prismaContext.course.findUnique({ where: { id: courseId } });

	const course = await prismaContext.course.update({
		where: { id: courseId },
		data: {
			archivedAt: null,
			archivedById: null,
			archiveReason: null,
		},
	});

	await prismaContext.courseHistory.create({
		data: {
			action: 'RESTORE' as CourseEventType,
			courseId,
			userId: actorId,
			comment,
		},
	});

	return course;
}

export async function getCourseArchiveContext(courseId: number) {
	return prisma.course.findUnique({
		where: { id: courseId },
		select: {
			id: true,
			archivedAt: true,
			maintainers: { select: { id: true } },
		},
	});
}

export async function getArchivedCourses(
	userId: string,
	includeAll: boolean = false,
): Promise<ArchivedCourse[]> {
	return prisma.course.findMany({
		where: {
			archivedAt: { not: null },
			...(includeAll ? {} : { maintainers: { some: { id: userId } } }),
		},
		orderBy: { archivedAt: 'desc' },
		include: {
			maintainers: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					username: true,
				},
			},
			coverPic: true,
			publications: {
				select: { id: true, title: true, archivedAt: true },
			},
		},
	});
}

export async function findCourseByName(courseName: string): Promise<Course | null> {
	return prisma.course.findFirst({
		where: {
			courseName: courseName,
			archivedAt: null,
		}
	});
}

export async function findCourseByNameIncludingArchived(courseName: string): Promise<Course | null> {
	return prisma.course.findUnique({ where: { courseName } });
}

export async function findCourseByMantainer(userId: string): Promise<Course[]> {
	return prisma.course.findMany({
		where: {
			archivedAt: null,
			maintainers: {
				some: {
					id: userId
				}
			}
		}
	});
}

export async function getAllCourses(): Promise<Course[]> {
	return prisma.course.findMany({ where: { archivedAt: null } });
}


export type PublicationWithRelations = Prisma.PublicationGetPayload<{
  include: {
    maintainers: true;
    tags: true;
    comments: {
      include: {
        user: true;
        replies: true;
        likedBy: true;
      };
    };
    publisher: true;
    savedBy: true;
    likedBy: true;
    reportedBy: true;
    node: true;
    savedByAllTime: true;
    coverPic: true;
    similarToThis: true;
    thisSimilarTo: true;
    materials: true;
    circuit: true;
    course: true;
  };
}>;

export async function getPublicationsForCourse(c: Number): Promise<PublicationWithRelations[]> {
	return await prisma.publication.findMany({
		where: {
			courseId: c,
			archivedAt: null,
			course: { archivedAt: null },
		},
		orderBy: { createdAt: 'desc' },
		include: {
			maintainers: true,
			tags: true,
			comments: {
				include: {
					user: true,
					replies: true,
					likedBy: true
				}
			},
			publisher: true,
			savedBy: true,
			likedBy: true,
			reportedBy: true,
			node: true,
			savedByAllTime: true,
			coverPic: true,
			similarToThis: true,
			thisSimilarTo: true,
			materials: true,
			circuit: true,
			course: true
		} // optional, if you want newest first
	});

	// return Promise.all(publications.map(async (pub ) => ({
	// 	...pub,
	// 	// coverPicData: (await coverPicFetcher(null, pub)).data
	// })))
}
