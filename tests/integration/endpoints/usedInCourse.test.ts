import {describe, expect, it} from "vitest";
import {createMaterialPublication, createUser} from "$lib/database";
import {Difficulty} from "@prisma/client";
import {testingUrl} from "../setup";

describe('[POST] /user/:id/use-in-course/:publicationId', () => {
    it('should successfully use a publication in a course', async () => {
        const body = {
            firstName: 'Kirilcho',
            lastName: 'Panayotov',
            email: 'email@student.tudelft.nl',
            profilePic: 'image.jpg'
        };
        const user =
            await createUser(body.firstName, body.lastName, body.email, body.profilePic);

        const publication = await createMaterialPublication(
            user.id,
            {
                title: "cool publication3345",
                description: "This publication has description",
                difficulty: Difficulty.easy,
                coverPic: 'cover',
                copyright: true,
                timeEstimate: 4,
                theoryPractice: 9,
                learningObjectives: [],
                prerequisites: []
            }
        );

        const response = await fetch(`${testingUrl}/user/${user.id}/use-in-course/${publication.publicationId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                courses: ["ADS", "ML"]
            })
        });
        expect(response.status).toBe(200);

        const response2 = await fetch(`${testingUrl}/publication/${publication.publicationId}/use-in-course`);
        expect(response2.status).toBe(200);

        const body2 = await response2.json();

        expect(body2).toHaveLength(2);
        expect(body2).toContain("ADS");
        expect(body2).toContain("ML");
    });

    it('should return 404 when user does not exist', async () => {
        const response = await fetch(`${testingUrl}/user/${830957945}/use-in-course/${34567890}`, {
            method: 'POST',
        });
        expect(response.status).toBe(404);
        const responseBody = await response.json();
        expect(responseBody.error).toBe("User not found");
    });

    it('should return 404 when publication does not exist', async () => {
        const body = {
            firstName: 'Kirilcho',
            lastName: 'Panayotov',
            email: 'email@student.tudelft.nl',
            profilePic: 'image.jpg'
        };
        const user =
            await createUser(body.firstName, body.lastName, body.email, body.profilePic);

        const response = await fetch(`${testingUrl}/user/${user.id}/use-in-course/${34567890}`, {
            method: 'POST',
        });
        expect(response.status).toBe(404);
        const responseBody = await response.json();
        expect(responseBody.error).toBe("Publication not found");
    });
});

describe("[GET] /publication/{publicationId}/used-in-course", () => {
    it("should return 204 when no content", async () => {
        const body = {
            firstName: 'Kirilcho',
            lastName: 'Panayotov',
            email: 'email@student.tudelft.nl',
            profilePic: 'image.jpg'
        };
        const user =
            await createUser(body.firstName, body.lastName, body.email, body.profilePic);

        const publication = await createMaterialPublication(
            user.id,
            {
                title: "cool publication",
                description: "This publication has description",
                difficulty: Difficulty.easy,
                coverPic: 'cover',
                copyright: true,
                timeEstimate: 4,
                theoryPractice: 9,
                learningObjectives: [],
                prerequisites: []
            }
        );
        const response = await fetch(`${testingUrl}/publication/${publication.publicationId}/use-in-course`);
        expect(response.status).toBe(204);
    });

    it("should return 404 when no publication", async () => {
        const response = await fetch(`${testingUrl}/publication/${456787}/use-in-course`);
        expect(response.status).toBe(404);
    })
});