import {prisma} from "$lib/database";

export function addFiles(paths: string[], titles: string[], materialId: number) {
    const files = paths.map((path, index) => {
        return {
            path: path,
            title: titles[index],
            materialId: materialId
        };
    });

    return prisma.file.createMany({
        data: files
    });
}
