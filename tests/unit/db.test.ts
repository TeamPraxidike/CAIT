import { describe, it, expect, vi } from 'vitest';
import { prisma } from '$lib/database';
import { getPublicationById, getAllPublications } from '$lib/database/db';
import Fuse from 'fuse.js';

describe('getPublicationById', () => {
	it('should return a publication with the given id', async () => {
		const mockPublication = {
			id: 1,
			title: 'Test Publication',
			tags: [],
			publisher: {},
		};
		prisma.publication.findUnique = vi
			.fn()
			.mockResolvedValue(mockPublication);

		const result = await getPublicationById(1);

		expect(result).toEqual(mockPublication);
		expect(prisma.publication.findUnique).toHaveBeenCalledWith({
			where: { id: 1 },
			include: {
				usedInCourse: true,
				tags: true,
				publisher: {
					include: {
						profilePic: true,
					},
				},
				maintainers: {
					include: {
						profilePic: true,
					},
				},
				coverPic: true,
				comments: {
					include: {
						replies: {
							include: {
								user: {
									include: {
										profilePic: true,
									},
								},
							},
						},
						user: {
							include: {
								profilePic: true,
							},
						},
					},
				},
				materials: {
					include: {
						publication: true,
						files: true,
					},
				},
				circuit: {
					include: {
						publication: {
							include: {
								tags: true,
							},
						},
						nodes: {
							include: {
								publication: {
									include: {
										tags: true,
										materials: true,
										circuit: true,
										coverPic: true,
										publisher: {
											include: {
												profilePic: true,
											},
										},
										usedInCourse: true,
									},
								},
								next: true,
							},
						},
					},
				},
			},
		});
	});

	it('should return null if publication is not found', async () => {
		prisma.publication.findUnique = vi.fn().mockResolvedValue(null);

		const result = await getPublicationById(999);

		expect(result).toBeNull();
		expect(prisma.publication.findUnique).toHaveBeenCalledWith({
			where: { id: 999 },
			include: {
				usedInCourse: true,
				tags: true,
				publisher: {
					include: {
						profilePic: true,
					},
				},
				maintainers: {
					include: {
						profilePic: true,
					},
				},
				coverPic: true,
				comments: {
					include: {
						replies: {
							include: {
								user: {
									include: {
										profilePic: true,
									},
								},
							},
						},
						user: {
							include: {
								profilePic: true,
							},
						},
					},
				},
				materials: {
					include: {
						publication: true,
						files: true,
					},
				},
				circuit: {
					include: {
						publication: {
							include: {
								tags: true,
							},
						},
						nodes: {
							include: {
								publication: {
									include: {
										tags: true,
										materials: true,
										circuit: true,
										coverPic: true,
										publisher: {
											include: {
												profilePic: true,
											},
										},
										usedInCourse: true,
									},
								},
								next: true,
							},
						},
					},
				},
			},
		});
	});
});

describe('getAllPublications', () => {
	it('should return publications filtered by publisher IDs', async () => {
		const mockPublications = [
			{ id: 1, title: 'Test Publication', publisherId: '1', tags: [] },
		];
		prisma.publication.findMany = vi
			.fn()
			.mockResolvedValue(mockPublications);

		const result = await getAllPublications(['1'], '');

		expect(result).toEqual(mockPublications);
		expect(prisma.publication.findMany).toHaveBeenCalledWith({
			where: {
				AND: [{ publisherId: { in: ['1'] } }],
			},
			include: {
				tags: true,
				materials: true,
				circuit: true,
				coverPic: true,
				publisher: {
					include: {
						profilePic: true,
					},
				},
				usedInCourse: {
					select: {
						course: true,
					},
				},
			},
		});
	});

	it('should return publications filtered by search query', async () => {
		const mockPublications = [
			{
				id: 1,
				title: 'Test Publication',
				description: 'Description',
				learningObjectives: 'Objectives',
				tags: [],
			},
		];
		prisma.publication.findMany = vi
			.fn()
			.mockResolvedValue(mockPublications);

		const result = await getAllPublications([], 'Test');

		const searcher = new Fuse(mockPublications, {
			keys: [
				{ name: 'title', weight: 0.4 },
				{ name: 'description', weight: 0.4 },
				{ name: 'learningObjectives', weight: 0.2 },
			],
			isCaseSensitive: false,
			threshold: 0.6,
			shouldSort: true,
		});

		const expectedPublications = searcher.search('Test').map((m) => m.item);

		expect(result).toEqual(expectedPublications);
		expect(prisma.publication.findMany).toHaveBeenCalledWith({
			where: {
				AND: [],
			},
			include: {
				tags: true,
				materials: true,
				circuit: true,
				coverPic: true,
				publisher: {
					include: {
						profilePic: true,
					},
				},
				usedInCourse: {
					select: {
						course: true,
					},
				},
			},
		});
	});

	it('should return all publications if no filters are applied', async () => {
		const mockPublications = [
			{ id: 1, title: 'Test Publication', tags: [] },
		];
		prisma.publication.findMany = vi
			.fn()
			.mockResolvedValue(mockPublications);

		const result = await getAllPublications([], '');

		expect(result).toEqual(mockPublications);
		expect(prisma.publication.findMany).toHaveBeenCalledWith({
			where: {
				AND: [],
			},
			include: {
				tags: true,
				materials: true,
				circuit: true,
				coverPic: true,
				publisher: {
					include: {
						profilePic: true,
					},
				},
				usedInCourse: {
					select: {
						course: true,
					},
				},
			},
		});
	});
});
