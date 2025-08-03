import type { CourseWithMaintainersAndProfilePic } from '$lib/database/courses';
import type {User} from '$lib/database/user';

export type UserWithProfilePic = User & { profilePicData: string | null};

export function changeCourse(course: number | null, previousCourse: number | null, LOs: string[], PKs: string[] , courses: CourseWithMaintainersAndProfilePic[], maintainers: UserWithProfilePic[]){
	// Remove learning objectives and prerequisites that are a part of the previous course
	const prevCourse = courses.find(c => c.id === previousCourse);
	LOs = LOs.filter(l => !prevCourse?.learningObjectives.includes(l));
	PKs = PKs.filter(p => !prevCourse?.prerequisites.includes(p));
	maintainers = maintainers.filter(m => !prevCourse?.maintainers.map(pm => pm.id).includes(m.id));

	previousCourse = course;

	// Add learning objectives, prerequisites, and maintainers from the newly selected course
	for (let i = 0; i < courses.length; i++) {
		if (courses[i].id === course) {
			const lo = new Set(LOs);
			const pk = new Set(PKs);
			const mt = new Map(maintainers.map(m => [m.id, m]));

			courses[i].learningObjectives.forEach(obj => lo.add(obj));
			courses[i].prerequisites.forEach(obj => pk.add(obj));
			courses[i].maintainers.forEach(m => mt.set(m.id, m));

			LOs = Array.from(lo);
			PKs = Array.from(pk);
			maintainers = Array.from(new Set(mt.values()));
			break;
		}
	}

	return {
		previousCourse,
		course,
		LOs,
		PKs,
		maintainers
	};
}