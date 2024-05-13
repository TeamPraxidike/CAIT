import {createUser, getUserById} from "$lib/database";
import {describe, it, expect} from "vitest";
import {randomUUID} from "node:crypto";


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



