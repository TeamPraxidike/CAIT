import type {File as PrismaFile} from "@prisma/client"
import {compare} from "$lib/FileSimilarityUtils/main";

async function compareFiles(pubAFiles: PrismaFile[], pubBFiles: PrismaFile[]) {
    return compare(pubAFiles, pubBFiles);
}

const methods  = {compareFiles}

export default methods
