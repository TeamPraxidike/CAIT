import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import Piscina from 'piscina';
import {
	getAllCircuits,
	getCircuitByPublicationId,
	handleSimilarity
} from "$lib/database";
import {
	compareNodesInBackground,
	compareMetaInBackground,
	compareFilesInBackground,
	initialMaterialFileParseInBackground,
	enqueueCircuitComparison, type ResultMeta, type PublicationMeta, type ResultFile, type FileTokenInfo
} from '$lib/PiscinaUtils/runner';
import { Difficulty, MaterialType, PublicationType } from '@prisma/client';

vi.mock('piscina');
vi.mock('$lib/database', () => ({
	getAllCircuits: vi.fn(),
	getAllMaterials: vi.fn(),
	getCircuitByPublicationId: vi.fn(),
	getMaterialByPublicationId: vi.fn(),
	handleSimilarity: vi.fn()
}));
vi.mock('$lib/database/file', () => ({
	getFilesForMaterial: vi.fn(),
	handleFileTokens: vi.fn()
}));
vi.mock('path', async (importOriginal) => {
	const actual = await importOriginal() as typeof import("path");
	return {
		...actual,
		join: vi.fn().mockReturnValue('mocked-path')
	};
});


describe('comparison functions', () => {
	let mockPiscinaRun: ReturnType<typeof vi.fn>;
	let mockPiscinaInstance: Piscina;

	beforeEach(() => {
		mockPiscinaRun = vi.fn();
		mockPiscinaInstance = {
			run: mockPiscinaRun
		} as unknown as Piscina;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should compare nodes in background', async () => {
		mockPiscinaRun.mockResolvedValue(0.9);
		const result = await compareNodesInBackground([1, 2, 3], [4, 5, 6], mockPiscinaInstance);
		expect(result).toBe(0.9);
		expect(mockPiscinaRun).toHaveBeenCalledWith({ pubANodes: [1, 2, 3], pubBNodes: [4, 5, 6] }, { name: 'compareNodes' });
	});

	it('should compare meta in background', async () => {
		const mockResultMeta: ResultMeta = {
			title: 0.9,
			description: 0.8,
			learningObjectives: 0.7,
			prerequisites: 0.6,
			tags: 0.5,
			difficulty: 0.4
		};
		mockPiscinaRun.mockResolvedValue(mockResultMeta);
		const pubAMeta: PublicationMeta = { title: 'A', description: 'Desc A', learningObjectives: ['A1'], prerequisites: ['P1'], tags: ['tagA'], difficulty: Difficulty.easy };
		const pubBMeta: PublicationMeta = { title: 'B', description: 'Desc B', learningObjectives: ['B1'], prerequisites: ['P1'], tags: ['tagB'], difficulty: Difficulty.hard };
		const result = await compareMetaInBackground(pubAMeta, pubBMeta, mockPiscinaInstance);
		expect(result).toEqual(mockResultMeta);
		expect(mockPiscinaRun).toHaveBeenCalledWith({ pubA: pubAMeta, pubB: pubBMeta }, { name: 'compareMeta' });
	});

	it('should compare files in background', async () => {
		const mockResultFile: ResultFile = {
			similarity: 0.9,
			filesToUpdate: [{ filePath: 'path/to/file', tokens: 'tokenString', chunks: [] }]
		};
		mockPiscinaRun.mockResolvedValue(mockResultFile);
		const mockFileA = {
			path: 'path/to/fileA',
			title: 'File A',
			type: 'text',
			text: 'some text',
			userId: 'user1',
			publicationId: 1,
			courseId: null,
			materialId: 1
		};
		const mockFileB = {
			path: 'path/to/fileB',
			title: 'File B',
			type: 'text',
			text: 'some other text',
			userId: 'user2',
			publicationId: 2,
			courseId: null,
			materialId: 2
		};
		const result = await compareFilesInBackground([mockFileA], [mockFileB], mockPiscinaInstance);
		expect(result).toEqual(mockResultFile);
		expect(mockPiscinaRun).toHaveBeenCalledWith({ pubAFiles: [mockFileA], pubBFiles: [mockFileB] }, { name: 'compareFiles' });
	});

	it('should parse initial material file in background', async () => {
		const mockFileTokenInfo: FileTokenInfo = [{ filePath: 'path/to/file', tokens: 'tokenString', chunks: [] }];
		mockPiscinaRun.mockResolvedValue(mockFileTokenInfo);
		const mockFile = {
			path: 'path/to/file',
			title: 'File',
			type: 'text',
			text: 'some text',
			userId: 'user1',
			publicationId: 1,
			courseId: null,
			materialId: 1
		};
		const result = await initialMaterialFileParseInBackground([mockFile], mockPiscinaInstance);
		expect(result).toEqual(mockFileTokenInfo);
		expect(mockPiscinaRun).toHaveBeenCalledWith({ pubFiles: [mockFile] }, { name: 'initialParse' });
	});

	it('should enqueue material comparison', async () => {
		const mockFiles = [{
			path: 'path/to/file',
			title: 'File',
			type: 'text',
			text: 'some text',
			userId: 'user1',
			profilePic: null,
			publicationId: 1,
			coverPic: null,
			materialId: 1
		}];
		const publication = {
			id: 1,
			title: 'Title',
			description: 'Description',
			maintainers: [],
			difficulty: Difficulty.easy,
			likes: 0,
			tags: [{ content: 'tag' }],
			learningObjectives: ['LO'],
			prerequisites: ['PR'],
			createdAt: new Date(),
			updatedAt: new Date(),
			isDraft: false,
			courseId: null,
			comments: [],
			publisher: {
				id: 'pub1',
				firstName: 'First',
				lastName: 'Last',
				username: 'username',
				email: 'email@example.com',
				emailVerified: new Date(),
				reputation: 0,
				password: null,
				aboutMe: '',
				platformId: 'platform1',
				institutionId: 'institution1',
				saved: [],
				posts: [],
				liked: [],
				reported: [],
				usedPublications: [],
				likedComments: [],
				likedReplies: [],
				maintaining: [],
				comments: [],
				replies: [],
				isAdmin: false,
				profilePic: null,
				accounts: [],
				sessions: [],
				createdAt: new Date(),
				updatedAt: new Date(),
				Authenticator: []
			},
			publisherId: 'pub1',
			coverPic: null,
			savedBy: [],
			likedBy: [],
			reportedBy: [],
			type: PublicationType.Material,
			node: [],
			savedByAllTime: [],
			similarToThis: [],
			thisSimilarTo: [],
			usedInCourse: []
		}
		const mockMaterial = {
			id: 1,
			publicationId: 1,
			copyright: 'Copyright',
			encapsulatingType: MaterialType.video,
			timeEstimate: null,
			theoryPractice: null,
			publication: publication,
			files: mockFiles
		} as any;

		///////////////////
		const mockFiles2 = [{
			path: 'path/to/file',
			title: 'File',
			type: 'text',
			text: 'some text',
			userId: 'user1',
			profilePic: null,
			publicationId: 2,
			coverPic: null,
			courseId: null,
			materialId: 1
		}];
		const publication2 = {
			id: 2,
			title: 'Title 2',
			description: 'Description 2',
			maintainers: [],
			difficulty: Difficulty.hard,
			likes: 0,
			tags: [{ content: 'tag' }],
			learningObjectives: ['LO'],
			prerequisites: ['PR'],
			createdAt: new Date(),
			updatedAt: new Date(),
			isDraft: false,
			courseId: null,
			comments: [],
			publisher: {
				id: 'pub1',
				firstName: 'First 2',
				lastName: 'Last 2',
				username: 'username 2',
				email: 'email2@example.com',
				emailVerified: new Date(),
				reputation: 0,
				password: null,
				aboutMe: '',
				saved: [],
				posts: [],
				liked: [],
				reported: [],
				usedPublications: [],
				likedComments: [],
				likedReplies: [],
				maintaining: [],
				comments: [],
				replies: [],
				isAdmin: false,
				profilePic: null,
				accounts: [],
				sessions: [],
				createdAt: new Date(),
				updatedAt: new Date(),
				Authenticator: []
			},
			publisherId: 'pub2',
			coverPic: null,
			savedBy: [],
			likedBy: [],
			reportedBy: [],
			type: PublicationType.Material,
			node: [],
			savedByAllTime: [],
			similarToThis: [],
			thisSimilarTo: [],
			usedInCourse: []
		}
		const mockMaterial2 = {
			id: 1,
			publicationId: 2,
			copyright: 'Copyright',
			encapsulatingType: MaterialType.assignment,
			timeEstimate: null,
			theoryPractice: null,
			publication: publication2,
			files: mockFiles2
		} as any;
		///////////////////

		// Dynamically import the modules
		const databaseModule = await import('$lib/database');
		const fileModule = await import('$lib/database/file');
		const piscinaUtilsModule = await import('$lib/PiscinaUtils/runner');

		const mockReturnValue = [mockMaterial, mockMaterial2] as any;

		const getFilesMock = vi.spyOn(fileModule, 'getFilesForMaterial').mockResolvedValue(mockFiles);

		const getAllMaterialsMock= vi.spyOn(databaseModule, 'getAllMaterials').mockImplementation( () => mockReturnValue);
		const getMaterialPubIdMock = vi.spyOn(databaseModule, 'getMaterialByPublicationId').mockResolvedValue(mockMaterial);

		mockPiscinaRun
			// first call initial parsing
			.mockResolvedValueOnce([{ filePath: 'path/to/file', tokens: 'tokenString' }])
			// in for loop, compare files in background
			.mockResolvedValueOnce({ similarity: 0.9, filesToUpdate: [] })
			// in for loop, compare meta in background
			.mockResolvedValueOnce({ title: 0.9,
			description: 0.8,
			learningObjectives: 0.7,
			prerequisites: 0.6,
			tags: 0.5,
			difficulty: 0.4});

		// Call the function that uses the mocks
		await piscinaUtilsModule.enqueueMaterialComparison(1, 1, mockPiscinaInstance);

		// Assert that the mocks were called with the correct arguments
		expect(getFilesMock).toHaveBeenCalledWith(1);
		expect(getAllMaterialsMock).toHaveBeenCalled();
		expect(getMaterialPubIdMock).toHaveBeenCalledWith(1);
		expect(mockPiscinaRun).toHaveBeenNthCalledWith(1, { pubFiles: mockFiles }, { name: 'initialParse' });
		expect(mockPiscinaRun).toHaveBeenNthCalledWith(2, { pubAFiles: mockFiles, pubBFiles: mockFiles2 }, { name: 'compareFiles' });
		expect(mockPiscinaRun).toHaveBeenNthCalledWith(3, {
			pubA: {
				title: 'Title',
				description: 'Description',
				learningObjectives: ['LO'],
				prerequisites: ['PR'],
				tags: ['tag'],
				difficulty: Difficulty.easy
			},
			pubB: {
				title: 'Title 2',
				description: 'Description 2',
				learningObjectives: ['LO'],
				prerequisites: ['PR'],
				tags: ['tag'],
				difficulty: Difficulty.hard
			}
		}, { name: 'compareMeta' });
		expect(databaseModule.handleSimilarity).toHaveBeenCalled();
		expect(fileModule.handleFileTokens).toHaveBeenCalled();

	});

	it('should enqueue circuit comparison', async () => {
		const mockCircuits = [{ publicationId: 2,
			publication: {
				title: 'Title',
				description: 'Description',
				learningObjectives: ['LO'],
				prerequisites: ['PR'],
				tags: [{ content: 'tag' }],
				difficulty: 'EASY',
				coverPic: null,
				id: 2,
				likes: 0,
				createdAt: new Date(),
				updatedAt: new Date(),
				isDraft: false,
				courseId: null,
				publisherId: 'pub2'
			},
			nodes: [{ publicationId: 3 }]
		}] as any;
		const mockCircuit = {
			publication: {
				title: 'Title',
				description: 'Description',
				learningObjectives: ['LO'],
				prerequisites: ['PR'],
				tags: [{ content: 'tag' }],
				difficulty: 'EASY',
				coverPic: null,
				id: 1,
				likes: 0,
				createdAt: new Date(),
				updatedAt: new Date(),
				isDraft: false,
				courseId: null,
				publisherId: 'pub1'
			},
			nodes: [{ publicationId: 3 }]
		} as any;
		vi.mocked(getAllCircuits).mockResolvedValue(mockCircuits);
		vi.mocked(getCircuitByPublicationId).mockResolvedValue(mockCircuit);


		mockPiscinaRun
			.mockResolvedValueOnce(0.9)
			.mockResolvedValueOnce({
				title: 0.9,
				description: 0.8,
				learningObjectives: 0.7,
				prerequisites: 0.6,
				tags: 0.5,
				difficulty: 0.4
			});

		await enqueueCircuitComparison(1, mockPiscinaInstance);

		expect(getAllCircuits).toHaveBeenCalled();
		expect(getCircuitByPublicationId).toHaveBeenCalledWith(1);
		expect(mockPiscinaRun).toHaveBeenNthCalledWith(1, { pubANodes: [3], pubBNodes: [3] }, { name: 'compareNodes' });
		expect(mockPiscinaRun).toHaveBeenNthCalledWith(2, {
			pubA: {
				title: 'Title',
				description: 'Description',
				learningObjectives: ['LO'],
				prerequisites: ['PR'],
				tags: ['tag'],
				difficulty: 'EASY'
			},
			pubB: {
				title: 'Title',
				description: 'Description',
				learningObjectives: ['LO'],
				prerequisites: ['PR'],
				tags: ['tag'],
				difficulty: 'EASY'
			}
		}, { name: 'compareMeta' });
		expect(handleSimilarity).toHaveBeenCalled();
	});
});