import {describe, it, expect} from 'vitest';
import {testingUrl} from "../setup";
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

        it('should respond with 400 if the id is malformed', async () => {
            const response = await fetch(`${testingUrl}/circuit/-1`, {method: 'GET'});
            expect(response.status).toBe(400);
            const body = await response.json();
            expect(body.error).toEqual('Bad Request - Invalid ID');
            expect(body).not.toHaveProperty('id');
        });
    });
});
