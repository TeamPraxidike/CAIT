import fs from 'node:fs';
import path from 'node:path';

export const FIXTURE_DIR = 'tests/e2e/fixtures';
export const SMALL_PDF = path.join(FIXTURE_DIR, 'sample.pdf');
export const LARGE_PDF = path.join(FIXTURE_DIR, 'large.pdf');

// Builds large.pdf (~10MB) from the committed sample.pdf by appending null bytes,
// so it overflows the 6MiB TUS chunk. Generated at runtime so the big
// binary never lives in git.
export function ensureFixtures() {
    if (!fs.existsSync(SMALL_PDF)) {
        throw new Error(`Missing ${SMALL_PDF}`);
    }
    if (!fs.existsSync(LARGE_PDF)) {
        const base = fs.readFileSync(SMALL_PDF);
        const padding = Buffer.alloc(10 * 1024 * 1024); // ~10MB of zero bytes
        fs.writeFileSync(LARGE_PDF, Buffer.concat([base, padding]));
    }
}