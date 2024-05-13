import { describe, it, expect, vi} from 'vitest';
import {
    getAllMaterials,
    getMaterialByPublicationId
} from '$lib/database/material';

import {prisma} from "$lib/database";

describe('get specific material', () => {
    it('should return a material by publicationId', async () => {
        prisma.material.findUnique = vi.fn().mockResolvedValue({
            id: 2, coverPic: 'cover1.jpg', publicationId: 1
        });

        const material = await getMaterialByPublicationId(1);
        expect(material).toMatchObject({ id: 2, coverPic: 'cover1.jpg', publicationId: 1 });
    });
});

describe('get all materials', () => {
    it('should return all materials', async () => {
        prisma.material.findMany = vi.fn().mockResolvedValue([
            { id: 3, coverPic: 'cover1.jpg', publicationId: 1 },
            { id: 4, coverPic: 'cover2.jpg', publicationId: 2 }
        ]);

        const materials = await getAllMaterials();
        expect(materials).toHaveLength(2);
        expect(materials[0].publicationId).toBe(1);
        expect(materials[1].publicationId).toBe(2);
    });
});