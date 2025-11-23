import { redirect, type RequestEvent } from '@sveltejs/kit';

export async function extractCourseData(formData: FormData, locals: App.Locals) {
	const title = formData.get('title');
	const level = formData.get('level');
	const learningObjectives = JSON.parse(formData.get('learningObjectives') as string);
	const prerequisites = JSON.parse(formData.get('prerequisites') as string);
	const maintainers = JSON.parse(formData.get('maintainers') as string);
	const copyright = formData.get('copyright') as string;

	const coverPicFile = formData.get('coverPic');
	let coverPic = null;

	if (coverPicFile instanceof File) {
		const buffer = await coverPicFile.arrayBuffer();
		const info = Buffer.from(buffer).toString('base64');
		coverPic = {
			type: coverPicFile.type,
			info,
		};
	}

	return {
		learningObjectives: learningObjectives,
		prerequisites: prerequisites,
		educationalLevel: level,
		courseName: title,
		creatorId: locals.session?.user.id,
		copyright: copyright,
		maintainers: maintainers,
		coverPic: coverPic,
	};
}

export async function publishCourseAction({request, fetch, locals}: RequestEvent) {
	const session = await locals.safeGetSession();
	if (!session || !session.user) throw redirect(303, '/signin');

	try {
		const formData = await request.formData();
		const courseData = await extractCourseData(formData, locals);

		const res = await fetch(`/api/course`, {
			method: 'POST',
			body: JSON.stringify(courseData),
		});

		const newCourse = await res.json();
		return { status: res.status, id: newCourse.id, context: 'course-form', course: newCourse};
	} catch (error) {
		console.error("Error creating course ", error);
	}
}

export async function editCourseAction({request, fetch, locals}: RequestEvent) {
	const session = await locals.safeGetSession();
	if (!session || !session.user) throw redirect(303, '/signin');

	try {
		const formData = await request.formData();
		const courseData = await extractCourseData(formData, locals);

		const res = await fetch(`/api/course/${formData.get('id')}` , {
			method: 'PUT',
			body: JSON.stringify(courseData),
		});

		const updatedCourse = await res.json();
		return { status: res.status, id: updatedCourse.id, context: 'course-form', course: updatedCourse };
	} catch (error) {
		console.error('Error updating course ', error);
		return { status: 500, context: 'course-form' };
	}
}