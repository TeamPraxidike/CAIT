import { openDB } from 'idb';
import type { User } from '@prisma/client';

const DB_NAME = 'FileStorage';
const DB_VERSION = 1;
const COVER_STORE = 'cover';
const FILES_STORE = 'files';
const METADATA_STORE = 'metadata_snapshots';

type UserWithProfilePic = User & { profilePicData: string };

type FormSnapshot = {
	title: string; // persisted
	description: string; // persisted
	tags: string[];
	newTags: string[];
	LOs: string[]; // persisted
	PKs: string[]; // persisted
	selectedType: string; // persisted
	difficulty: string; // persisted
	maintainers: UserWithProfilePic[];
	searchableUsers: UserWithProfilePic[];
	estimate: string; // persisted
	copyright: string; // persisted
	theoryApplicationRatio: number; // persisted
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

/** Cover Picture **/
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

/** Multiple Files (store as an Array<File>) **/
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

// Save snapshot (you can parametrize the key if you want multiple forms)
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