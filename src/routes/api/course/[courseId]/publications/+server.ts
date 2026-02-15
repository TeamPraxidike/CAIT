import { verifyAuth } from '$lib/database/auth';
import { createCourse, type createCourseData, findCourseByName, getAllCourses, getCourseByIdExtended, getPublicationsForCourse } from '$lib/database/courses';
import { updateCoverPic } from '$lib/database';


export async function GET({ locals, params }) {
    console.log('awegfaioseufbesalifbeasilfubasoelfbesilafbaselkjyfb')
    const authError = await verifyAuth(locals, locals.user?.id);
    if (authError) return authError;

    try {
        let id = Number(params.courseId)
        console.log(id);
        const courses = await getPublicationsForCourse(id);
        return new Response(JSON.stringify(courses), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error }), { status: 500 });
    }
}