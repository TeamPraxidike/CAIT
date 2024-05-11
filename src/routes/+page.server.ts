import {LocalFileSystem} from "$lib/fileSystem/localFileSystem";
import {Difficulty} from "@prisma/client";

export const actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        const name = (data.get('file') as File).name;
        
        const fileSystem = new LocalFileSystem();
        const path = await fileSystem.saveFile(data.get('file') as Blob, name);

        const materialData = {
            title: data.get('title'),
            description: data.get('description'),
            copyright: data.get('copyright'),
            difficulty: data.get('difficulty') as Difficulty,
            timeEstimate: data.get('timeEstimate'),
            theoryPractice: data.get('theoryPractice'),
            userId: data.get('userId'),
            paths: [path],
            titles: [name]
        };

        await fetch(request.url + "api/material", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(materialData)
        });

        console.log((fileSystem.readFile(path)).toString());
        fileSystem.deleteFile(path);
    }
};
