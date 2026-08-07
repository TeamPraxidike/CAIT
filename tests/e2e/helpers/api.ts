import { type Page } from '@playwright/test';

// Creates a PUBLISHED material via POST /api/material as the currently
// authenticated persona - bypassing the heavy TUS stepper (that UI path is
// tested once, in PMAT-01). The page's cookie jar must belong to
// `authorUsername`: verifyAuth requires session.user.id === the posted userId.
//
// A non-draft material needs (per isMaterialValid): >=1 LO, >=1 tag, a
// materialType, and >=1 file. We satisfy the file requirement with an external
// fileURL, so no upload is needed. Returns the publication id + title;
// the view URL is /{authorUsername}/{id}.
export async function createMaterial(
    page: Page,
    authorUsername: string,
    overrides: {
        title?: string;
        tags?: string[];
        isDraft?: boolean;
        course?: number | null;
        maintainers?: string[];
    } = {},
): Promise<{ id: number; title: string }> {
    const who = await page.request.get(`/api/user/username/${authorUsername}`);
    if (!who.ok()) throw new Error(`resolve ${authorUsername} failed: ${who.status()}`);
    const userId = (await who.json()).user.id;

    const title =
        overrides.title ?? `e2e-material-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const res = await page.request.post('/api/material', {
        data: {
            userId,
            metaData: {
                title,
                description: 'Created via API for E2E.',
                difficulty: 'easy',
                learningObjectives: ['Understand the E2E fixture.'],
                prerequisites: [],
                materialType: ['lectureNotes'],
                copyright: 'No copyright',
                timeEstimate: 0,
                theoryPractice: 0.5,
                selfMade: true,
                tags: overrides.tags ?? ['machine learning'], // existing seed tag
                maintainers: overrides.maintainers ?? [],
                isDraft: overrides.isDraft ?? false,
                fileURLs: ['https://example.com/e2e-sample.pdf'],
                course: overrides.course ?? null,
            },
            coverPic: null,
            fileDiff: {add: [], delete: [], edit: []},
        },
    });
    if (!res.ok()) throw new Error(`createMaterial failed: ${res.status()} ${await res.text()}`);
    return {id: (await res.json()).id, title};
}