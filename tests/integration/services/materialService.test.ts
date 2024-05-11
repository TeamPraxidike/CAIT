import {createMaterialPublication, createUser, prisma} from "$lib/database";
import {describe, it, expect} from "vitest";
import {Difficulty} from "@prisma/client";

describe("createMaterialPublication", () => {
    it("should create a material publication with files", async () => {
        const user = await createUser("John", "Doe", "l", false);
        const material = await createMaterialPublication({
            title: "Priklucheniqta na Vasko",
            description: "Vasko nqma kraka",
            difficulty: Difficulty.hard,
            userId: user.id,
            timeEstimate: 1000,
            theoryPractice: 9,
            copyright: true,
            paths: ["./vasko/nqma/kraka.txt"],
            titles: ["vaskoGoworiNaKitaiski.txt"]
        })
        expect(material).toHaveProperty("id");

        const mat = await prisma.material.findUnique({
            where: {id: material.id}
        });
        if(mat === null) throw new Error("Material not found");
        expect(mat.copyright).toBe(true);
        expect(mat.timeEstimate).toBe(1000);

        const file = await prisma.file.findUnique(
            {where: {path: "./vasko/nqma/kraka.txt"}}
        );

        if(file === null) throw new Error("File not found");

        expect(file.title).toEqual("vaskoGoworiNaKitaiski.txt");
    });
});

