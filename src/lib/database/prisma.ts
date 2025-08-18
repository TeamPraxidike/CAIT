import { PrismaClient } from './prismaClient';
//import { withOptimize } from "@prisma/extension-optimize";

import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { withOptimize } = require('@prisma/extension-optimize');

export const prisma: PrismaClient = new PrismaClient().$extends(
	withOptimize({ apiKey: process.env.OPTIMIZE_API_KEY })
);
