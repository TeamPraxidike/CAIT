import {beforeEach} from "vitest";
import {prisma} from "$lib/db"


const resetDb = async () => {
    await prisma.$transaction([
        prisma.user.deleteMany(),
        prisma.publication.deleteMany(),
        prisma.material.deleteMany(),
        prisma.circuit.deleteMany(),
        prisma.node.deleteMany(),
        prisma.tag.deleteMany(),
        prisma.comment.deleteMany(),
        prisma.reply.deleteMany()
    ])
}


// reset all tables before each test
beforeEach(async () => {
    await resetDb()
});

export const testingUrl = 'http://localhost:4173/api';