import type {
	CourseWithCoverPic,
	CourseWithMaintainersAndProfilePic,
} from '$lib/database/courses';
import type {User} from '$lib/database/user';

export type UserWithProfilePic = User & { profilePicData: string | null};

export function changeCourse(newCourse: number | null, currentCourse: number | null, LOs: string[], PKs: string[] , courses: CourseWithCoverPic[], maintainers: UserWithProfilePic[]){
	// Remove learning objectives and prerequisites that are a part of the previous course
	const prevCourse = courses.find(c => c.id === currentCourse);
	LOs = LOs.filter(l => !prevCourse?.learningObjectives.includes(l));
	PKs = PKs.filter(p => !prevCourse?.prerequisites.includes(p));
	maintainers = maintainers.filter(m => !prevCourse?.maintainers.map(pm => pm.id).includes(m.id));

	// Add learning objectives, prerequisites, and maintainers from the newly selected course
	for (let i = 0; i < courses.length; i++) {
		if (courses[i].id === newCourse) {
			const lo = new Set(LOs);
			const pk = new Set(PKs);
			const mt = new Map(maintainers.map(m => [m.id, m]));

			courses[i].learningObjectives.forEach(obj => lo.add(obj));

			courses[i].prerequisites.forEach(obj => pk.add(obj));

			if (courses[i].maintainers) {
				courses[i].maintainers.forEach(m => {
					if (m && m.id) {
						mt.set(m.id, m);
					}
				});
			}

			LOs = Array.from(lo);
			PKs = Array.from(pk);
			maintainers = Array.from(new Set(mt.values()));

			break;
		}
	}

	return {
		course: newCourse,
		LOs,
		PKs,
		maintainers
	};
}

export async function deleteCourseById(courseId: number): Promise<void> {
	const res = await fetch(`/api/course/${courseId}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		}
	});
	if (!res.ok) {
		let body = '';
		try {
			body = await res.text();
		} catch {
			// ignore
		}
		throw new Error(`Failed to delete course ${courseId}: ${res.status} ${body}`);
	}
}