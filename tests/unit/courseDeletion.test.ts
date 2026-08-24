import { describe, expect, it, vi } from 'vitest';
import { prisma } from '$lib/database/prisma';
import { deleteCourse } from '$lib/database/courses';

describe('deleteCourse', () => {
	it('detaches publications and deletes the course in one transaction', async () => {
		const updateMany = vi.fn().mockResolvedValue({ count: 2 });
		const deleteRecord = vi.fn().mockResolvedValue({ id: 7 });

		vi.spyOn(prisma, '$transaction').mockImplementation(async (callback) =>
			callback({
				publication: { updateMany },
				course: { delete: deleteRecord },
			} as never),
		);

		await expect(deleteCourse(7)).resolves.toEqual({ id: 7 });
		expect(updateMany).toHaveBeenCalledWith({
			where: { courseId: 7 },
			data: { courseId: null },
		});
		expect(deleteRecord).toHaveBeenCalledWith({ where: { id: 7 } });
	});
});
