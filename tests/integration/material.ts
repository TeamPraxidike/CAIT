import {describe, it, expect} from 'vitest';
import {testingUrl} from "./setup";
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

        // it('should respond with 200 and the publication if it exists', async () => {
        //     const newUser =
        //         await createUser('ivan', 'shishman', 'ivanshishman@pliska.bg', false);
        //
        //     const response = await fetch(`${testingUrl}/user/${newUser.id}`, {method: 'GET'});
        //     expect(response.status).toBe(200);
        //     const body = await response.json();
        //     expect(body.id).toBe(newUser.id);
        //
        //     // no one else is actually in the db
        //     expect(await prisma.user.count()).toBe(1);
        // });
    });
});
