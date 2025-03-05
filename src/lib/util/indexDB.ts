import { openDB } from 'idb';
import type { Difficulty, User } from '@prisma/client';
import type { NodeInfo } from '$lib/components/circuits/methods/CircuitTypes';
import { CircuitComponent } from '$lib';

const DB_NAME = 'FileStorage';
const DB_VERSION = 1;
const COVER_STORE = 'cover';
const FILES_STORE = 'files';
const METADATA_STORE = 'metadata_snapshots';

type UserWithProfilePic = User & { profilePicData: string };

export type FormSnapshot = {
	title: string; // for materials + circuits
	description: string; // for materials + circuits
	tags: string[]; // for materials + circuits
	newTags: string[]; // for materials + circuits
	LOs: string[];  // for materials + circuits
	PKs: string[];  // for materials + circuits
	maintainers: UserWithProfilePic[]; // for materials + circuits
	searchableUsers: UserWithProfilePic[]; // for materials + circuits
	selectedType?: string; // -- for materials ONLY
	difficulty?: Difficulty; // -- for materials ONLY
	estimate?: string;  // -- for materials ONLY
	copyright?: string;  // -- for materials ONLY
	theoryApplicationRatio?: number;  // -- for materials ONLY
	circuitNodes?: NodeInfo[]; // -- for circuits ONLY
};

export async function initDB() {
	return openDB(DB_NAME, DB_VERSION, {
		upgrade(db) {
			if (!db.objectStoreNames.contains(COVER_STORE)) {
				db.createObjectStore(COVER_STORE);
			}
			if (!db.objectStoreNames.contains(FILES_STORE)) {
				db.createObjectStore(FILES_STORE);
			}
			if (!db.objectStoreNames.contains(METADATA_STORE)) {
				db.createObjectStore(METADATA_STORE);
			}
		}
	});
}

// TODO: can I merge with other file operations? Should I?
// Cover picture specific
export async function saveCover(file: File) {
	const db = await initDB();
	await db.put(COVER_STORE, file, 'coverPic');
}
export async function getCover(): Promise<File | undefined> {
	const db = await initDB();
	return db.get(COVER_STORE, 'coverPic');
}
export async function deleteCover() {
	console.log("DELETING COVER");
	const db = await initDB();
	await db.delete(COVER_STORE, 'coverPic');
}

// File operations, actually cool
export async function saveFiles(files: File[]) {
	const db = await initDB();
	// Save under a fixed key, e.g. 'uploadedFiles'
	await db.put(FILES_STORE, files, 'uploadedFiles');
}
export async function getFiles(): Promise<File[]> {
	const db = await initDB();
	const result = await db.get(FILES_STORE, 'uploadedFiles');
	return result || []; // return empty array if nothing stored
}
export async function clearFiles() {
	console.log("DELETING FILES");
	const db = await initDB();
	await db.delete(FILES_STORE, 'uploadedFiles');
}

// Save snapshot
export async function saveSnapshot(snapshotData: FormSnapshot) {
	console.log("SAVING SNAPSHOT")
	const db = await initDB();
	await db.put(METADATA_STORE, snapshotData, 'myFormSnapshot');
}

// Get snapshot
export async function getSnapshot(): Promise<FormSnapshot | undefined> {
	const db = await initDB();
	return (await db.get(METADATA_STORE, 'myFormSnapshot')) as FormSnapshot;
}

// Clear snapshot
export async function clearSnapshot() {
	console.log("DELETING SNAPSHOT");
	const db = await initDB();
	await db.delete(METADATA_STORE, 'myFormSnapshot');
}