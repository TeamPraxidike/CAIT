import { type Page } from '@playwright/test';

// Resolves a persona's user id from their username. verifyAuth pins every
// create action to this id, so the page's cookie jar must belong to `username`.
async function resolveUserId(page: Page, username: string): Promise<string> {
    const who = await page.request.get(`/api/user/username/${username}`);
    if (!who.ok()) throw new Error(`resolve ${username} failed: ${who.status()}`);
    return (await who.json()).user.id;
}

// Creates a PUBLISHED material via POST /api/material as the currently
// authenticated persona. The page's cookie jar must belong to
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
    const userId = await resolveUserId(page, authorUsername);

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

export async function createCourse(
    page: Page,
    creatorUsername: string,
    overrides: {
        courseName?: string;
        educationalLevel?: string;
        learningObjectives?: string[];
        prerequisites?: string[];
        maintainers?: string[];
    } = {},
): Promise<{ id: number; courseName: string }> {
    const creatorId = await resolveUserId(page, creatorUsername);

    const courseName =
        overrides.courseName ?? `e2e crs ${Date.now()} ${Math.random().toString(36).slice(2, 7)}`;

    const res = await page.request.post('/api/course', {
        data: {
            creatorId,
            courseName,
            educationalLevel: overrides.educationalLevel ?? 'Bachelor',
            learningObjectives:
                overrides.learningObjectives ?? ['Understand the E2E course fixture.'],
            prerequisites: overrides.prerequisites ?? ['None'],
            maintainers: overrides.maintainers ?? [],
            copyright: 'No copyright',
            coverPic: null,
        },
    });
    if (!res.ok()) throw new Error(`createCourse failed: ${res.status()} ${await res.text()}`);
    return { id: (await res.json()).id, courseName };
}

export async function createCourseWithMaterial(
    page: Page,
    authorUsername: string,
    overrides: { courseName?: string; materialTitle?: string } = {},
): Promise<{
    course: { id: number; courseName: string };
    material: { id: number; title: string };
}> {
    const course = await createCourse(page, authorUsername, { courseName: overrides.courseName });
    const material = await createMaterial(page, authorUsername, {
        title: overrides.materialTitle,
        course: course.id,
    });
    return { course, material };
}