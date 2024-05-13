import {describe, it, expect} from 'vitest';
import {testingUrl, resetUserTable} from "../setup";
import {createUser} from "$lib/database";

await resetUserTable();

describe('Users', () => {
    describe('[GET] /user/:id', () => {
        it('should respond with 404 if the user does not exist', async () => {
            const response = await fetch(`${testingUrl}/user/1`, {method: 'GET'});
            expect(response.status).toBe(404);
            const body = await response.json();
            expect(body.error).toBe('User not found');
            expect(body).not.toHaveProperty('firstName');
        });

        it('should respond with 200 and the user if it exists', async () => {
            const newUser =
                await createUser('ivan', 'shishman', 'ivanshishman@pliska.bg', false);

            const response = await fetch(`${testingUrl}/user/${newUser.id}`, {method: 'GET'});
            expect(response.status).toBe(200);
            const body = await response.json();
            expect(body.id).toBe(newUser.id);
        });
    });
});
