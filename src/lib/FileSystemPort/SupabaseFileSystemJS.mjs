import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { Agent } from 'undici';

/**
 * Adapter interface for the FileSystem Port that deals with file management locally.
 * This is used to abstract the file system operations from the rest of the application.
 * This class is used to interact with the local file system (within the server) and
 * not with a cloud bucket storage.
 */
export class SupabaseFileSystem{
	/**
	 * Creates an instance of SupabaseFileSystem.
	 * @param {string} supabaseUrl - The Supabase URL
	 * @param {string} supabaseKey - The Supabase key
	 * @param {string} bucketName - The Supabase Storage bucket name
	 */
	constructor(supabaseUrl, supabaseKey, bucketName) {
		this.supabaseUrl = supabaseUrl;
		this.supabaseKey = supabaseKey;
		this.bucketName = bucketName;

		//  originalError: TypeError: fetch failed
		//  [cause]: SocketError: other side closed
		// TODO: this tries to (at the very least) minimize reuse of stale connections
		// otherwise Piscina (which keeps workers alive) migth try to reuse a closed socket
		// verify that it works

		// Undici Agent (controls connection reuse for fetch)
		const dispatcher = new Agent({
			// this disables keep-alive
			pipelining: 0
		});

		const customFetch = (url, init = {}) =>
			fetch(url, { ...init, dispatcher });


		this.supabase = createClient(this.supabaseUrl, this.supabaseKey, {
			global: { fetch: customFetch },
			auth: { persistSession: false }
		});

		//this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
	}

	/**
	 * Save a file to the Supabase Storage bucket.
	 *
	 * @param {Buffer} file - Binary data of the file
	 * @param {string} name - The name of the file
	 * @param {string} ownerId - File owner uuid
	 * @returns {Promise<string>} The path/key of the saved file in the bucket
	 */
	async saveFile(file, name, ownerId) {
		if (!file) throw new Error('No file provided');

		try {
			const fileExtension = (name.split('.').pop()) || '';
			const pathFileNameGenerated = `${randomUUID()}.${fileExtension}`;

			const { data, error } = await this.supabase
				.storage
				.from(this.bucketName)
				.upload(pathFileNameGenerated, file, {
					cacheControl: '3600', // 60 minutes
					metadata: {
						"ownerId": ownerId,
					}
				});

			if (error) throw error;
			return data.path;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Delete a file from the Supabase Storage bucket.
	 *
	 * @param {string} pathArg - The path (key) to the file
	 * @returns {Promise<void>}
	 */
	async deleteFile(pathArg) {
		const { error } = await this.supabase
			.storage
			.from(this.bucketName)
			.remove([pathArg]);

		if (error) throw error;
	}

	/**
	 * Read a file from the Supabase Storage bucket and return its binary data as a Buffer.
	 *
	 * @param {string} pathArg - The path (key) to the file
	 * @returns {Promise<Buffer>}
	 */
	async readFile(pathArg) {
		const { data, error } = await this.supabase
			.storage
			.from(this.bucketName)
			.download(pathArg);

		if (error) throw error;
		const arrayBuffer = await data.arrayBuffer();
		return Buffer.from(new Uint8Array(arrayBuffer));
	}

	// TODO: Method needs to be rewritten IF editing is going to be supported
	/**
	 * Edit a file in the Supabase Storage bucket (overwrite it).
	 *
	 * @param {string} pathArg - The path (key) to the file
	 * @param {Buffer} file - The binary data of the file
	 * @returns {Promise<string>}
	 */
	async editFile(pathArg, file) {
		await this.deleteFile(pathArg);

		const { data, error } = await this.supabase
			.storage
			.from(this.bucketName)
			.upload(pathArg, file, {
				cacheControl: '3600',
				upsert: false
			});

		if (error) throw error;
		return data.path;
	}
}