import {createMaterialPublication, createUser, getPublicationById, getUserById} from "$lib/database";
import {describe, it, expect, beforeEach} from "vitest";
import {randomUUID} from "node:crypto";
import {editUser, getLikedPublications, likePublication, unlikePublication} from "$lib/database/user";
import {resetUserTable} from "../setup";
import {Difficulty, type Material, type User} from "@prisma/client";

await resetUserTable();

describe("Creating users", () => {
    it("should increase the id by 1", async () => {
        const user = await createUser("Vasko", "Prasko", "l", "vasko.pdf");
        expect(await getUserById(user.id)).toHaveProperty("username", "VaskoPrasko");

        for(let i = 2; i < 20; i++) {
            const newUser = await createUser("Vasko", "Prasko", randomUUID(), randomUUID());
            expect(await getUserById(newUser.id)).toHaveProperty("username", "VaskoPrasko_" + i);
        }
    });
});

describe("Editing users", () => {
    it("should change users", async () => {
        const user = await createUser("Bobi", "Bobi", "email@email", "vasko.pdf");

        await editUser({id: user.id, firstName: "Kiro", lastName: "Breika", email: "l", profilePic: "pdf.pdf"});

        const editedUser = await getUserById(user.id);
        expect(editedUser).toHaveProperty("firstName", "Kiro");
        expect(editedUser).toHaveProperty("lastName", "Breika");
        expect(editedUser).toHaveProperty("email", "l");
        expect(editedUser).toHaveProperty("profilePic", "pdf.pdf");

        expect(editedUser).toHaveProperty("username", "KiroBreika");
    });
});

describe("Liking publications", () => {
    let user : User;
    let publication : Material;
    beforeEach(async () => {
        user = await createUser("Bobi", "Damyanov", "email2@email", "vasko.pdf");
        publication = await createMaterialPublication({
            userId: user.id,
            title: "cool publication",
            description: "This publication has description",
            copyright: true,
            difficulty: Difficulty.easy
        });
        await likePublication(user.id, publication.publicationId);
    });


    it("should add it to the liked list", async () => {
        const liked = await getLikedPublications(user.id);
        if(liked === null){
            throw Error("liked was null");
        }
        expect(liked.liked.length).toBe(1);
        expect(liked.liked[0].id).toBe(publication.publicationId);
        expect(liked.liked[0].title).toBe("cool publication");
    });

    it("should increase the liked value in the publication", async () => {
        const updatedPublication = await getPublicationById(publication.publicationId);
        if(updatedPublication === null) {
            throw Error("Publication does not exist");
        }
        expect(updatedPublication.likes).toBe(1);
    });

    it("should remove it from the liked list when unliked", async () => {
        await unlikePublication(user.id, publication.publicationId);
        const liked = await getLikedPublications(user.id);
        if(liked === null){
            throw Error("liked was null");
        }
        expect(liked.liked.length).toBe(0);
    });

    it("should decrement the number of liked in the publication", async () => {
        await unlikePublication(user.id, publication.publicationId);
        const updatedPublication = await getPublicationById(publication.publicationId);
        if(updatedPublication === null) {
            throw Error("Publication does not exist");
        }
        expect(updatedPublication.likes).toBe(0);
    });

});






