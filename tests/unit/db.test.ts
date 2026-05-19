import { describe, it, expect, vi } from 'vitest';
import { prisma } from '$lib/database';
import { getPublicationById, getAllPublications } from '$lib/database/db';
import Fuse from 'fuse.js';
import { createUniqueMaterial } from '../utility/publicationsUtility.ts';
import { createUniqueUser } from '../utility/users.ts';

const mockUser = await createUniqueUser()
const mockPublication = await createUniqueMaterial(mockUser.id);

describe('getPublicationById', () => {
	it('should return a publication with the given id', async () => {
		prisma.publication.findUnique = vi
			.fn()
			.mockResolvedValue(mockPublication);

		const result = await getPublicationById(mockPublication.id);

		expect(result).toEqual(mockPublication);
		expect(prisma.publication.findUnique).toHaveBeenCalledWith({
			where: { id: mockPublication.id },
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
						files: {
							select: {
								path: true,
								title: true,
								type: true,
							},
						},
						fileURLs: true,
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
				course: {
					select: {
						id: true,
						courseName: true,
						learningObjectives: true,
						prerequisites: true,
						educationalLevel: true,
					},
				},
			},
		});
	});

	it('should return null if publication is not found', async () => {
		prisma.publication.findUnique = vi.fn().mockResolvedValue(null);

		const id = 45674598;
		const result = await getPublicationById(id);

		expect(result).toBeNull();
		expect(prisma.publication.findUnique).toHaveBeenCalledWith({
			where: { id: id },
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
						files: {
							select: {
								path: true,
								title: true,
								type: true,
							},
						},
						fileURLs: true,
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
				course: {
					select: {
						id: true,
						courseName: true,
						learningObjectives: true,
						prerequisites: true,
						educationalLevel: true,
					},
				},
			},
		});
	});
});

describe('getAllPublications', () => {
	it('should return publications filtered by publisher IDs', async () => {
		const mockPublications = [mockPublication]
		prisma.publication.findMany = vi
			.fn()
			.mockResolvedValue(mockPublications);

		const result = await getAllPublications([mockUser.id], '', 'Most Liked');

		expect(result).toEqual(mockPublications);
		expect(prisma.publication.findMany).toHaveBeenCalledWith({
			where: {
				AND: [{ publisherId: { in: [mockUser.id] } }],
			},
			orderBy: {
				likes: 'desc',
			},
			include: {
				tags: true,
				materials: true,
				circuit: true,
				coverPic: true,
				publisher: {
					select: {
						firstName: true,
						lastName: true,
						username: true,
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

		const result = await getAllPublications([], 'Test', 'Most Liked');

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
			orderBy: {
				likes: 'desc',
			},
			include: {
				tags: true,
				materials: true,
				circuit: true,
				coverPic: true,
				publisher: {
					select: {
						firstName: true,
						lastName: true,
						username: true,
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

		const result = await getAllPublications([], '', 'Most Liked');

		expect(result).toEqual(mockPublications);
		expect(prisma.publication.findMany).toHaveBeenCalledWith({
			where: {
				AND: [],
			},
			orderBy: {
				likes: 'desc',
			},
			include: {
				tags: true,
				materials: true,
				circuit: true,
				coverPic: true,
				publisher: {
					select: {
						firstName: true,
						lastName: true,
						username: true,
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
