import { SupabaseFileSystem } from './FileSystemPort/SupabaseFileSystemJS.mjs';
// import { SERVICE_ROLE_KEY } from '$env/static/private';
// import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import 'dotenv/config';

export const basePath = "uploadedFiles"
//export const fileSystem = new LocalFileSystem(basePath);
export const fileSystem = new SupabaseFileSystem(process.env.PUBLIC_SUPABASE_URL, process.env.SERVICE_ROLE_KEY, basePath)
