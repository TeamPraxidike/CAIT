import {describe, it, expect} from 'vitest';
import {testingUrl} from "./setup";
// import {getAllCircuits, getCircuitByPublicationId, prisma} from "$lib/database";

describe('Circuits', () => {
    describe('[GET] /circuit/:id', () => {
        it('should respond with 404 if the publication of type circuit does not exist', async () => {
            const response = await fetch(`${testingUrl}/circuit/1`, {method: 'GET'});
            expect(response.status).toBe(404);
            const body = await response.json();
            expect(body.error).toBe('Circuit Not Found');
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
