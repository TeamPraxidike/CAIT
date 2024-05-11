import {getAllMaterials, createMaterialPublication} from "$lib/database";
import type { RequestHandler } from '@sveltejs/kit';

// import fs from "fs";

export const GET: RequestHandler = async () => {
    // Authentication step
    // return 401 if user not authenticated

    try {
        const materials = await getAllMaterials();
        return new Response(JSON.stringify(materials), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
    }
}

export const POST: RequestHandler = async ({request}) => {
    const body = await request.json();

    const material = await createMaterialPublication({
        userId: body.userId,
        title: body.title,
        description: body.description,
        copyright: body.copyright,
        difficulty: body.difficulty,
        timeEstimate: body.timeEstimate,
        theoryPractice: body.theoryPractice,
        paths: body.paths,
        titles: body.titles
    });

    return new Response(JSON.stringify({material}), {status: 200});
}

