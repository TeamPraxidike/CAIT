import { PrismaClient } from './prismaClient';

//TODO: this causes 409 conflicts with the remote dashboard. Could kill the entire process if not handled
//import { withOptimize } from "@prisma/extension-optimize";

// import { createRequire } from 'module';
//
// const require = createRequire(import.meta.url);
// const { withOptimize } = require('@prisma/extension-optimize');
//
// export const prisma: PrismaClient = new PrismaClient().$extends(
// 	withOptimize({ apiKey: process.env.OPTIMIZE_API_KEY })
// );

export const prisma: PrismaClient = new PrismaClient();
