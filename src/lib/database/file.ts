import {type FetchedFileArray, fileSystem, prisma} from "$lib/database";
import {Prisma} from "@prisma/client/extension";
import {Blob} from "node:buffer";

export async function bufToBase64(files: FetchedFileArray) {
    // If JSON stringify cannot handle raw Buffer, use this:
    return files.map(file => ({
        ...file,
        data: file.data.toString()
    }));
}

export async function addFile(title: string, type:string, info: Buffer, materialId: number,
                               prismaContext: Prisma.TransactionClient = prisma) {

    try{
        const path = await fileSystem.saveFile(info, title);
        try{
            return prismaContext.file.create({
                data: {
                    path: path,
                    title: title,
                    type,
                    materialId: materialId, // Associate the File with Material, could use connect, shouldn't matter
                },
            });
        } catch(errorDatabase){
            console.log(`Error while saving file ${title} in the the database.`);
            fileSystem.deleteFile(path);
            throw new Error("Rollback");
        }
    } catch (errorFileSystem){
        console.log(`Error while saving file ${title} in the system`);
        throw new Error("Rollback");
    }
}

export async function editFile(path: string, title: string, info: Buffer,
                               prismaContext: Prisma.TransactionClient = prisma) {

        try{
            await prismaContext.file.update({
                where: {
                    path: path
                },
                data: {
                    title: title
                },
            });

            try {
                await fileSystem.editFile(path, info);
            } catch (errorFileSystem){
                console.log(`Error while editing file ${title} in the system.`);
                throw new Error("Rollback");
            }
        } catch(errorDatabase){
            console.log(`Error while editing file ${title} in the the database.`);
            throw new Error("Rollback");
        }
}

export async function deleteFile(path: string, prismaContext: Prisma.TransactionClient = prisma) {
    try{
        await prismaContext.file.delete({where: {path: path}});

        try {
            fileSystem.deleteFile(path);
        } catch (errorFileSystem){
            console.log(`Error while deleting file in the system.`);
            throw new Error("Rollback");
        }
    } catch(errorDatabase){
        console.log(`Error while editing file in the database.`);
        throw new Error("Rollback");
    }
}
