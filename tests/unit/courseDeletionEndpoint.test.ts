import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/database/auth', () => ({
	canEditOrRemove: vi.fn(),
	unauthResponse: () => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
	verifyAuth: vi.fn(),
}));
vi.mock('$lib/database/courses', () => ({
	deleteCourse: vi.fn(),
	getCourseByIdExtended: vi.fn(),
	updateCourse: vi.fn(),
}));
vi.mock('$lib/database', () => ({
	fileSystem: { deleteFile: vi.fn() },
	updateCoverPic: vi.fn(),
}));
vi.mock('$lib/database/prisma', () => ({
	prisma: { course: { findUnique: vi.fn() } },
}));

import { canEditOrRemove } from '$lib/database/auth';
import { deleteCourse } from '$lib/database/courses';
import { fileSystem } from '$lib/database';
import { prisma } from '$lib/database/prisma';
import { DELETE } from '../../src/routes/api/course/[courseId]/+server';

describe('DELETE /api/course/[courseId]', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(canEditOrRemove).mockResolvedValue(true);
		vi.mocked(prisma.course.findUnique).mockResolvedValue({
			maintainers: [{ id: 'maintainer-id' }],
			coverPic: { path: 'course-cover.png' },
		} as never);
		vi.mocked(deleteCourse).mockResolvedValue({ id: 7 } as never);
	});

	it('deletes the course and its external cover object', async () => {
		const response = await DELETE({ params: { courseId: '7' }, locals: {} } as never);

		expect(response.status).toBe(200);
		expect(canEditOrRemove).toHaveBeenCalledWith({}, '', ['maintainer-id']);
		expect(deleteCourse).toHaveBeenCalledWith(7);
		expect(fileSystem.deleteFile).toHaveBeenCalledWith('course-cover.png');
	});

	it('rejects users without course-management permission', async () => {
		vi.mocked(canEditOrRemove).mockResolvedValue(false);
		const response = await DELETE({ params: { courseId: '7' }, locals: {} } as never);

		expect(response.status).toBe(401);
		expect(deleteCourse).not.toHaveBeenCalled();
	});
});
