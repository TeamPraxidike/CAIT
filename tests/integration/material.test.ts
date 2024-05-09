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

        it('should respond with 400 if the id is malformed', async () => {
            const response = await fetch(`${testingUrl}/material/-1`, {method: 'GET'});
            expect(response.status).toBe(400);
            const body = await response.json();
            expect(body.error).toEqual('Bad Request - Invalid ID');
            expect(body).not.toHaveProperty('id');
        });
    });
});
