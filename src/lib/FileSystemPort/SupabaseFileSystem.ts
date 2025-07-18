import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { insertOwnerId } from './insertOwnerId';
import type FileSystem from '$lib/FileSystemPort/FileSystem';

export class SupabaseFileSystem implements FileSystem {
	private readonly supabaseUrl: string;
	private readonly supabaseKey: string;
	private readonly bucketName: string;
	private supabase: ReturnType<typeof createClient>;

	constructor(supabaseUrl: string, supabaseKey: string, bucketName: string) {
		this.supabaseUrl = supabaseUrl;
		this.supabaseKey = supabaseKey;
		this.bucketName = bucketName;

		this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
	}

	/**
	 * Save a file to the Supabase Storage bucket.
	 *
	 * @param file Binary data of the file
	 * @param name The name of the file
	 * @param ownerId file owner uuid
	 * @returns Promise<string> The path/key of the saved file in the bucket
	 */
	async saveFile(file: Buffer, name: string, ownerId: string): Promise<string> {
		if (!file) throw new Error('No file provided');

		try{
			const pathFileNameGenerated =
				`${randomUUID()}` + `.${(name + '').split('.').pop()}`;

			const { data, error } = await this.supabase
				.storage
				.from(this.bucketName)
				.upload(pathFileNameGenerated, file, {
					cacheControl: '3600', // 60 minutes
					metadata: {
						"ownerId": ownerId
					}
				});

			if (error) throw error;
			await insertOwnerId(data!.id, ownerId);
			return data.path;
		}
		catch (error) {
			throw error;
		}
	}

	/**
	 * Delete a file from the Supabase Storage bucket.
	 *
	 * @param pathArg the path (key) to the file
	 */
	async deleteFile(pathArg: string): Promise<void> {
		const { error } = await this.supabase
			.storage
			.from(this.bucketName)
			.remove([pathArg]);

		if (error) throw error;
	}

	/**
	 * Read a file from the Supabase Storage bucket and return its binary data as a Buffer.
	 *
	 * @param pathArg the path (key) to the file
	 */
	async readFile(pathArg: string): Promise<Buffer> {
		const { data, error } = await this.supabase
			.storage
			.from(this.bucketName)
			.download(pathArg);

		if (error) throw error;
		const arrayBuffer = await data.arrayBuffer();
		return Buffer.from(new Uint8Array(arrayBuffer));
	}

	async readFileURL(pathArg: string): Promise<string> {
		const { data, error } = await this.supabase
			.storage
			.from(this.bucketName)
			.createSignedUrl(pathArg, 180)

		if (error) throw error;
		return data.signedUrl;
	}


	// TODO: Method needs to be rewritten IF editing is going to be supported
	/**
	 * Edit a file in the Supabase Storage bucket (overwrite it).
	 *
	 * @param pathArg the path (key) to the file
	 * @param file the binary data of the file
	 */
	async editFile(pathArg: string, file: Buffer): Promise<string> {
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