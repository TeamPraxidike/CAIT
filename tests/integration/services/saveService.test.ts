import {it, expect, describe, beforeEach} from "vitest";
import {Difficulty, type Material, type User} from "@prisma/client";
import {
    createMaterialPublication,
    createUser,
} from "$lib/database";
import {getSavedPublications, savePublication} from "$lib/database/save";

describe("Liking publications", () => {
    let user : User;
    let publication : Material;
    let savedMessage : string;

    beforeEach(async () => {
        user = await createUser("Bober", "Damyanov", "email2@email", "vasko.pdf");
        publication = await createMaterialPublication(
            user.id,
            "cool publication",
            "This publication has description",
            Difficulty.easy,
            ['lo1'],
            ['p1'],
            'cover',
            true,
            300,
            0.5
        );
        savedMessage = await savePublication(user.id, publication.publicationId);
    });

    it("should add it to the saved list", async () => {
        expect(savedMessage).toBe("Publication saved successfully");
        const saved = await getSavedPublications(user.id);
        if(saved === null){
            throw Error("liked was null");
        }
        expect(saved.saved).toHaveLength(1);
        expect(saved.saved[0].id).toBe(publication.publicationId);
        expect(saved.saved[0].title).toBe("cool publication");
    });

    it("should remove it from the saved list when unliked", async () => {
        const response = await savePublication(user.id, publication.publicationId);
        expect(response).toBe("Publication unsaved successfully");

        const saved = await getSavedPublications(user.id);
        if(saved === null){
            throw Error("saved was null");
        }
        expect(saved.saved.length).toBe(0);
    });

    it("should only allow a user to save each publication once", async () => {
       for(let i = 0; i < 10; i++){
           await savePublication(user.id, publication.publicationId);
       }
       const saved = await getSavedPublications(user.id);
       if(saved === null) throw new Error("Could not get saved publications list");
       expect(saved.saved.length).toBe(1);
    });
});