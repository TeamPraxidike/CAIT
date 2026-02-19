import { verifyAuth } from '$lib/database/auth';
import { createCourse, type createCourseData, findCourseByName, getAllCourses, getCourseByIdExtended, getPublicationsForCourse } from '$lib/database/courses';
import { coverPicFetcher, updateCoverPic } from '$lib/database';


export async function GET({ locals, params }) {
    const authError = await verifyAuth(locals, locals.user?.id);
    if (authError) return authError;

    try {
        let id = Number(params.courseId)
        let publications = await getPublicationsForCourse(id);
        publications = await Promise.all(publications.map(async (publication) => {
            return  {
                ...publication,
                coverPicData: (await coverPicFetcher(
                    null,
                    publication.coverPic
                ))
            }
        }))

        return new Response(JSON.stringify(publications), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error }), { status: 500 });
    }
}