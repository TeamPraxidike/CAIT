import {getAllMaterials, createMaterialPublication, addFiles} from "$lib/database";
import type { RequestHandler } from '@sveltejs/kit';
import fs from "fs";

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

export const POST: RequestHandler = async ({request }) => {
    const body = await request.json();
    const cookies = request.headers.get('cookie');
    if(cookies === null) return new Response(JSON.stringify({error: 'User not authenticated'}), {status: 401});
    const userId = Number(new URLSearchParams(cookies).get('userId'));

    if (isNaN(userId) || userId <= 0) {
        return new Response(
            JSON.stringify(
                { error: "Bad Request - Invalid user ID" }
            ), { status: 400 });
    }

    const material = await createMaterialPublication({
        userId,
        title: body.title,
        description: body.description,
        copyright: body.materialInfo.copyright,
        difficulty: body.difficulty,
        timeEstimate: body.materialInfo.timeEstimate,
        theoryPractice: body.materialInfo.theoryPractice
    });


    const files: File[] = body.files;
    if (files.length === 0) return new Response(JSON.stringify({error: 'No files uploaded'}), {status: 400});

    // save files to the server
    const paths = files.map(entry => {
        let file: File;

        if(entry instanceof File) file = entry;
        else return '';

        if (file === undefined) '';

        const path = `./public/files/${file.name}`;

        const reader = new FileReader();
        reader.onload = async () => {
            const fileContents = reader.result as string; // Assuming it's text

            // Write file contents to the filesystem
            try {
                await fs.promises.writeFile(path, fileContents);
                console.log('File saved successfully:', path);
            } catch (error) {
                return '';
            }
        };

        return path;
    });

    const titles = files.map(entry => {
        let file: File;

        if(entry instanceof File) file = entry;
        else return '';

        if (file === undefined) '';
        return file.name;
    });

    const filesSaved = await addFiles(paths, titles, material.id);
    return new Response(JSON.stringify({material, filesSaved}), {status: 200});
}
