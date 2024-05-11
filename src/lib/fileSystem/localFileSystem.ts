import fs from "fs";

export class LocalFileSystem {
    readonly basePath = 'localFiles/';
    // deleteFile(owner: User, file: File): PrismaFile {
    //     return undefined;
    // }
    //
    // editFile(owner: User, file: File): PrismaFile {
    //     return undefined;
    // }
    //
    // readFile(owner: User, file: File): PrismaFile {
    //     return undefined;
    // }

    async saveFile(file: Blob): Promise<string> {
        if(!file) {
            throw new Error('No file provided');
        }

        try {
            const fileContent = await file.arrayBuffer();
            const buffer = Buffer.from(fileContent);

            const path = this.basePath + `${Date.now() + Math.random() * 10000}`;
            fs.writeFile(path, buffer, function (err) {
                if (err) throw err;
                console.log('Saved!');
            });
            return path;
        } catch (error) {
            throw error;
        }
    }

}