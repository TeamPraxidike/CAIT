import {describe, expect, it} from 'vitest';
import {testingUrl, resetMaterialTable} from "../setup";
import {Difficulty} from "@prisma/client";
import {
    createMaterialPublication,
    createUser,
    prisma
} from "$lib/database";


async function populate(arg: string) {
    const user = await createUser("Vasko", "Vasko", "Vasko", false);
    return {
        title: 'Vasko and Friends',
        description: 'Vasko falls in love with Travis Scott',
        copyright: true,
        difficulty: Difficulty.easy,
        timeEstimate: 5,
        theoryPractice: 2,
        userId: user.id,
        paths: [`${arg}.txt`],
        titles: [`${arg}`]
    };
}

describe('Materials', async () => {
    it('should respond with 404 if the publication of type material does not exist', async () => {
        const response = await fetch(`${testingUrl}/material/1`, {method: 'GET'});
        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body.error).toBe('Material Not Found');
        expect(body).not.toHaveProperty('firstName');
    });

    // it('should respond with 500 if a server-side error occurs during execution', async () => {
    //     //prisma.material.findUnique = vi.fn().mockRejectedValue(new Error("Very important message"));
    //
    //     // prisma.material.findUnique = vi.fn().mockImplementation(() => {
    //     //     throw new Error("Very important message");
    //     // });
    //
    //     // vi.mock('$lib/database', async (importOriginal) => {
    //     //     const actual = await importOriginal<typeof import('$lib/database')>();
    //     //     return {
    //     //         ...actual,
    //     //         getMaterialByPublicationId: vi.fn().mockImplementation((publicationId) => {
    //     //             console.log(`Mock called with publicationId: ${publicationId}`);
    //     //             throw new Error("Very important message");
    //     //         })
    //     //     };
    //     // });
    //
    //     const response = await fetch(`${testingUrl}/material/1`, {method: 'GET'});
    //
    //     const responseBody = await response.json();
    //
    //     expect(response.status).toBe(500);
    //     expect(responseBody.error).toBe("Server error");
    //     vi.restoreAllMocks();
    // });

    it('should respond with 400 if the id is < 0', async () => {
        const response = await fetch(`${testingUrl}/material/-1`, {method: 'GET'});
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toEqual('Bad Request - Invalid ID');
        expect(body).not.toHaveProperty('id');
    });

    it('should respond with 400 if the id is = 0', async () => {
        const response = await fetch(`${testingUrl}/material/0`, {method: 'GET'});
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toEqual('Bad Request - Invalid ID');
        expect(body).not.toHaveProperty('id');
    });

    it('should respond with 400 if the id is malformed', async () => {
        const response = await fetch(`${testingUrl}/material/yoan`, {method: 'GET'});
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toEqual('Bad Request - Invalid ID');
        expect(body).not.toHaveProperty('id');
    });

    it('should respond with 200 if the publication of type material exists', async () => {
        const materialData = await populate("0");

        const material = await createMaterialPublication(materialData);

        const response = await fetch(`${testingUrl}/material/${material.publicationId}`, {method: 'GET'});
        expect(response.status).toBe(200);

        const responseBody = await response.json();

        expect(responseBody).toHaveProperty('publication.publisherId');
        expect(responseBody.publicationId).toBe(responseBody.publication.id);

        await resetMaterialTable();
    });


    // it('should respond with 500 if a server-side error occurs', async () => {
    //     prisma.material.findMany = vi.fn().mockRejectedValue(new Error("Very important message"));
    //
    //     const response = await fetch(`${testingUrl}/material`, {method: 'GET'});
    //     const responseBody = await response.json();
    //
    //     expect(response.status).toBe(500);
    //     expect(responseBody.error).toBe("Server error");
    //     vi.restoreAllMocks();
    // });

    it('should handle zero materials', async () => {
        const response = await fetch(`${testingUrl}/material`, {method: 'GET'});
        expect(response.status).toBe(200);

        const responseBody = await response.json();

        expect(responseBody).toHaveLength(0);
    });


    it('should handle one material', async () => {
        const materialData = await populate("0");

        await createMaterialPublication(materialData);

        const response = await fetch(`${testingUrl}/material`, {method: 'GET'});
        expect(response.status).toBe(200);

        const responseBody = await response.json();

        expect(responseBody[0]).toHaveProperty('publication.publisherId');
        expect(responseBody[0].publicationId).toBe(responseBody[0].publication.id);
        expect(responseBody).toHaveLength(1);

        await resetMaterialTable();
    });

    it('should handle two or more (random number) materials', async () => {
        const randomNumber = Math.round(Math.random() * 8) + 2;
        for (let i=0; i<randomNumber; i++) {
            const materialData = await populate(i.toString());
            await createMaterialPublication(materialData);
        }

        const response = await fetch(`${testingUrl}/material`, {method: 'GET'});
        expect(response.status).toBe(200);

        const responseBody = await response.json();

        expect(responseBody).toHaveLength(randomNumber);

        await resetMaterialTable();
    });

    it("should create a material publication with files", async () => {
        const user = await createUser("John", "Doe", "l", false);
        const material = await createMaterialPublication({
            title: "Priklucheniqta na Vasko",
            description: "Vasko nqma kraka",
            difficulty: Difficulty.hard,
            userId: user.id,
            timeEstimate: 1000,
            theoryPractice: 9,
            copyright: true,
            paths: ["./vasko/nqma/kraka.txt"],
            titles: ["vaskoGoworiNaKitaiski.txt"]
        })
        expect(material).toHaveProperty("id");

        const mat = await prisma.material.findUnique({
            where: {id: material.id}
        });
        if(mat === null) throw new Error("Material not found");
        expect(mat.copyright).toBe(true);
        expect(mat.timeEstimate).toBe(1000);

        const file = await prisma.file.findUnique(
            {where: {path: "./vasko/nqma/kraka.txt"}}
        );

        if(file === null) throw new Error("File not found");

        expect(file.title).toEqual("vaskoGoworiNaKitaiski.txt");

        await resetMaterialTable();
    });
});




