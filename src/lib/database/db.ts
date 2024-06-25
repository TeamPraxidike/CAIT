import { prisma } from '$lib/database';
import Fuse from 'fuse.js';

/**
 * Returns the publication with the given id. Gives no guarantee for the type of the publication.
 * @param id
 */
export async function getPublicationById(id: number) {
	return prisma.publication.findUnique({
		where: {
			id: id,
		},
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
}

export async function getAllPublications(publishers: string[], query: string) {
	const where: any = { AND: [] };

	if (publishers.length > 0) {
		where.AND.push({ publisherId: { in: publishers } });
	}

	let publications = await prisma.publication.findMany({
		where,
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

	if (query !== '') {
		const p = publications;
		const searcher = new Fuse(p, {
			keys: [
				{ name: 'title', weight: 0.4 },
				{ name: 'description', weight: 0.4 },
				{ name: 'learningObjectives', weight: 0.2 },
			],
			isCaseSensitive: false,
			threshold: 0.6,
			shouldSort: true,
		});
		publications = searcher.search(query).map((m) => m.item);
	}

	return publications;
}

export async function getAllPublicationsByIds(ids: number[]) {
	return prisma.publication.findMany({
		where: {
			id: { in: ids },
		},
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
}
