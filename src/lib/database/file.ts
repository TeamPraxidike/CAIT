import {prisma} from "$lib/database";
import {Prisma} from "@prisma/client/extension";

export async function addFiles(paths: string[], titles: string[], materialId: number,
                               prismaContext: Prisma.TransactionClient = prisma) {
    if(paths.length !== titles.length) throw new Error("Paths and titles must be of equal length");

    for (const file of paths) {
        const index = paths.indexOf(file);
        await prismaContext.file.create({
            data: {
                path: file,
                title: titles[index], // Example file title
                materialId: materialId, // Associate the file with the newly created Material
            },
        });
    }
}
