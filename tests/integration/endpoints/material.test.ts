import { describe, expect, it, beforeEach } from 'vitest';
import { resetMaterialTable, testingUrl } from '../setup';
import { createUniqueUser } from '../../utility/users';
import { createUniqueMaterial } from '../../utility/publicationsUtility';

it('should be AEY', () => {
    expect(3).toBe(3);
});



describe('Materials', async () => {
    describe('[GET] /material/:id', () => {
        it('should respond with 404 if the publication of type material does not exist', async () => {
            const response = await fetch(`${testingUrl}/material/8534853`, {
                method: 'GET',
            });
            expect(response.status).toBe(404);
            const body = await response.json();
            expect(body.error).toBe('Material Not Found');
            expect(body).not.toHaveProperty('firstName');
        });

        it('should respond with 400 if the id is < 0', async () => {
            const response = await fetch(`${testingUrl}/material/-1`, {
                method: 'GET',
            });
            expect(response.status).toBe(400);
            const body = await response.json();
            expect(body.error).toEqual('Bad Request - Invalid ID');
            expect(body).not.toHaveProperty('id');
        });

        it('should respond with 400 if the id is = 0', async () => {
            const response = await fetch(`${testingUrl}/material/0`, {
                method: 'GET',
            });
            expect(response.status).toBe(400);
            const body = await response.json();
            expect(body.error).toEqual('Bad Request - Invalid ID');
            expect(body).not.toHaveProperty('id');
        });

        it('should respond with 400 if the id is malformed', async () => {
            const response = await fetch(`${testingUrl}/material/yoan`, {
                method: 'GET',
            });
            expect(response.status).toBe(400);
            const body = await response.json();
            expect(body.error).toEqual('Bad Request - Invalid ID');
            expect(body).not.toHaveProperty('id');
        });

        it('should respond with 200 if the publication of type material exists', async () => {
            const user = await createUniqueUser();
            const material = await createUniqueMaterial(user.id);

            const response = await fetch(
                `${testingUrl}/material/${material.publicationId}`,
                { method: 'GET' },
            );
            expect(response.status).toBe(200);

            const responseBody = await response.json();
            expect(responseBody).toHaveProperty('material.publication.publisherId');
            expect(responseBody.material.publicationId).toBe(responseBody.material.publication.id);

            await resetMaterialTable();
        });
    });

    describe('[GET] /material', () => {
        beforeEach(async () => {
            await resetMaterialTable();
        });


        it('should handle one material', async () => {
            const user = await createUniqueUser();
            await createUniqueMaterial(user.id);

            const response = await fetch(`${testingUrl}/material`, { method: 'GET' });
            expect(response.status).toBe(200);

            const responseBody = await response.json();

            expect(responseBody.materials[0]).toHaveProperty('publication.publisherId');
            expect(responseBody.materials[0].publicationId).toBe(
                responseBody.materials[0].publication.id,
            );
            expect(responseBody.materials.length).toBeGreaterThanOrEqual(1);
        });

        // it('should handle two or more (random number) materials', async () => {
        //     // test is flacky because sometimes another test deletes the materials table before this one finishes
        //     const randomNumber = Math.ceil(Math.random() * 10);
        //     for (let i = 0; i < randomNumber; i++) {
        //         const user = await createUniqueUser();
        //         await createUniqueMaterial(user.id);
        //     }
        //
        //     const response = await fetch(`${testingUrl}/material`, { method: 'GET' });
        //     expect(response.status).toBe(200);
        //
        //     const responseBody = await response.json();
        //     expect(responseBody.materials.length).toBeGreaterThanOrEqual(randomNumber);
        // });
    });
    //
    // describe('[POST] /material', () => {
    //     it('should create a material publication with files', async () => {
    //         const user = await createUniqueUser();
    //         const materialData = {
    //             userId: user.id,
    //             metaData: {
    //                 title: "title",
    //                 description: "desc",
    //                 difficulty: "easy",
    //                 learningObjectives: [],
    //                 prerequisites: [],
    //                 materialType: "video",
    //                 copyright: "owner",
    //                 timeEstimate: 1000,
    //                 theoryPractice: 70,
    //                 tags: [],
    //                 maintainers: []
    //             },
    //             coverPic: null,
    //             fileDiff: {
    //                 add: [
    //                     {
    //                         title: "important",
    //                         type: "txt",
    //                         info: btoa('bara bara bara bere bere bere')
    //                     }
    //                 ],
    //                 delete: [],
    //                 edit: []
    //             }
    //         };
    //
    //         const response = await fetch(`${testingUrl}/material`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(materialData),
    //         });
    //         console.log(response);
    //         expect(response.status).toBe(200);
    //         const material = await response.json();
    //
    //         expect(material).toHaveProperty('id');
    //
    //         const mat = await getMaterialByPublicationId(material.id);
    //         if (mat === null) throw new Error('Material not found');
    //
    //         expect(mat.copyright).toBe("owner");
    //         expect(mat.timeEstimate).toBe(1000);
    //
    //         const file = await getFilesForMaterial(mat.id);
    //
    //         if (file === null) throw new Error('File not found');
    //         expect(file.length).toBe(1);
    //         expect(file[0].title).toBe('important');
    //         expect(file[0].type).toBe("txt");
    //         expect(file[0].materialId).toBe(mat.id);
    //
    //         await resetMaterialTable();
    //     });
    // });

    describe('[DELETE] /material/:id', () => {
        it('should respond with 400 if the id is < 0', async () => {
            const response = await fetch(`${testingUrl}/material/-1`, {
                method: 'DELETE',
            });
            expect(response.status).toBe(400);
            const body = await response.json();
            expect(body.error).toEqual('Bad Delete Request - Invalid Material publication Id');
            expect(body).not.toHaveProperty('publicationId');
            expect(body).not.toHaveProperty('timeEstimate');
        });
    });
    // it('should respond with 200 if successful', async () => {
    //     const user = await createUniqueUser();
    //     const materialData = {
    //         userId: user.id,
    //         metaData: {
    //             title: "title",
    //             description: "desc",
    //             difficulty: "easy",
    //             learningObjectives: [],
    //             prerequisites: [],
    //             materialType: "video",
    //             copyright: "owner",
    //             timeEstimate: 1000,
    //             theoryPractice: 70,
    //             tags: [],
    //             maintainers: []
    //         },
    //         coverPic: {
    //             type: "image",
    //             info: "url"
    //         },
    //         fileDiff: {
    //             add: [
    //                 {
    //                     title: "cool file",
    //                     type: "pdf",
    //                     info: "bara bara bara bere bere bere"
    //                 }
    //             ],
    //             delete: [],
    //             edit: []
    //         }
    //     };
    //     const createdResponse = await fetch(`${testingUrl}/material`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(materialData),
    //     });
    //     expect(createdResponse.status).toBe(200)
    //     const createdMat = await createdResponse.json();
    //
    //     const mat = await getMaterialByPublicationId(createdMat.id);
    //     if (mat === null) throw new Error('Material not found');
    //     const fileBefore = await getFilesForMaterial(mat.id);
    //     expect(fileBefore).toHaveLength(1);
    //
    //     const response = await fetch(
    //         `${testingUrl}/material/${createdMat.id}`,
    //         {
    //             method: 'DELETE',
    //         },
    //     );
    //     const fileAfter = await getFilesForMaterial(mat.id);
    //     expect(fileAfter).toHaveLength(0);
    //     expect(response.status).toBe(200);
    //     const body = await response.json();
    //     expect(body).toHaveProperty('id');
    //     expect(body).toHaveProperty('timeEstimate');
    //
    //     await resetMaterialTable();
    // });
});
