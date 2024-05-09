import {describe, it, expect} from 'vitest';
import {testingUrl} from "./setup";
import {Difficulty} from "@prisma/client";
import {createUser} from "$lib/database";
// import {getAllMaterials, getMaterialByPublicationId, prisma} from "$lib/database";

describe('Materials', () => {
    describe('[GET] /material/:id', () => {
        it('should respond with 404 if the publication of type material does not exist', async () => {
            const response = await fetch(`${testingUrl}/material/1`, {method: 'GET'});
            expect(response.status).toBe(404);
            const body = await response.json();
            expect(body.error).toBe('Material Not Found');
            expect(body).not.toHaveProperty('firstName');
        });

        it('should respond with 400 if the id is malformed', async () => {
            const response = await fetch(`${testingUrl}/material/-1`, {method: 'GET'});
            expect(response.status).toBe(400);
            const body = await response.json();
            expect(body.error).toEqual('Bad Request - Invalid ID');
            expect(body).not.toHaveProperty('id');
        });
    });
});


describe('POST request handler', () => {
    it('should save files and return the material and files saved', async () => {
        const url = `${testingUrl}/material`;
        const file = new File(['Hello, this is a test file.'], 'test.txt', {
            type: 'text/plain',
        });
        const user = await createUser("John", "Doe", "l", false);

        const data = {
            title: 'Vasko and friends',
            description: 'Vasko goes on an adventure with his friends.',
            materialInfo: {
                copyright: true,
                timeEstimate: 0,
                theoryPractice: 1
            },
            difficulty: Difficulty.easy, // Provide the difficulty level
            files: [file]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `userId=${user.id}` // Set your user ID as a cookie
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        expect(response.status).toEqual(200);
        console.log("bara bara");
        console.log(responseData);
        expect(responseData.material).toHaveProperty('timeEstimate', 0);
    });

    // Add more test cases as needed
});

