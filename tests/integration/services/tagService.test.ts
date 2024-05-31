import {describe, it, expect} from "vitest";
import {addTag, deleteTagByContent, getAllTags, getTagByContent} from "$lib/database/tag";
import {resetTagsTable} from "../setup";

await resetTagsTable();

describe("tagService", () => {
    it("should add a tag to a publication", async () => {
        await addTag("test tag");
        const tags = await getAllTags();
        expect(tags).toContainEqual({content: "test tag"});
        expect(await getTagByContent("test tag")).toEqual({content: "test tag"});
    });

    it("should multiple tags to a publication", async () => {
        await addTag("a test tag1");
        await addTag("a test tag2");
        await addTag("a test tag3");
        const tags = await getAllTags();
        expect(tags).toContainEqual({content: "a test tag1"});
        expect(tags).toContainEqual({content: "a test tag2"});
        expect(tags).toContainEqual({content: "a test tag3"});
    });

    it("should delete tags", async () => {
        await addTag("test tag1");
        await addTag("test tag2");
        await addTag("test tag3");

        await deleteTagByContent("test tag1");

        const tags = await getAllTags();
        expect(tags).not.toContainEqual({content: "test tag1"});
        expect(tags).toContainEqual({content: "test tag2"});
        expect(tags).toContainEqual({content: "test tag3"});
    });
});