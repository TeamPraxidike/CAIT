import type {User, File as PrismaFile} from '@prisma/client';


export default interface FileSystem {
    saveFile(owner: User, file: File): Promise<string>,
    deleteFile(owner: User, file: File): PrismaFile,
    readFile(owner: User, file: File): PrismaFile,
    editFile(owner: User, file: File): PrismaFile
}