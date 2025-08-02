import type { CourseWithMaintainersAndProfilePic } from '$lib/database/courses';
import type {User} from '$lib/database/user';

export type UserWithProfilePic = User & { profilePicData: string | null};

export function changeCourse(course: number | null, previousCourse: number | null, LOs: string[], PKs: string[] , courses: CourseWithMaintainersAndProfilePic[]){
	// Remove learning objectives and prerequisites that are a part of the previous course
	const prevCourse = courses.find(c => c.id === previousCourse);
	LOs = LOs.filter(l => !prevCourse?.learningObjectives.includes(l));
	PKs = PKs.filter(p => !prevCourse?.prerequisites.includes(p));




	previousCourse = course;

	// Add learning objectives and prerequisites from the newly selected course, while keeping custom ones
	for (let i = 0; i < courses.length; i++) {
		if (courses[i].id === course) {
			const lo = new Set(LOs);
			const pk = new Set(PKs);
			courses[i].learningObjectives.forEach(obj => lo.add(obj));
			courses[i].prerequisites.forEach(obj => pk.add(obj));
			LOs = Array.from(lo);
			PKs = Array.from(pk);
			break;
		}
	}

	return {
		previousCourse,
		course,
		LOs,
		PKs
	}
}