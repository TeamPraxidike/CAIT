import { SupabaseFileSystem } from './FileSystemPort/SupabaseFileSystemJS.mjs';
import { LocalFileSystem } from './FileSystemPort/LocalFileSystemJS.mjs';
import 'dotenv/config';

/////////////////////////////////////////////////////////
/// SELECT FILESYSTEM TYPE (specifically for Piscina/Similarity)
// BASED ON .ENV VARIABLE
////////////////////////////////////////////////////////

export const basePath = "uploadedFiles"
let fileSystem;

if (process.env.FILESYSTEM === "SUPABASE") {
	fileSystem = new SupabaseFileSystem(process.env.PUBLIC_SUPABASE_URL,
		process.env.SERVICE_ROLE_KEY, basePath)
}
else fileSystem = new LocalFileSystem(basePath);

export {fileSystem}

