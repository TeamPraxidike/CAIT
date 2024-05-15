import {createUser, getUserById} from "$lib/database";
import {describe, it, expect} from "vitest";
import {randomUUID} from "node:crypto";
import {editUser} from "$lib/database/user";
import {resetUserTable} from "../setup";

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




