// vitest.config.integration.ts
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(viteConfig, defineConfig({
    test: {
        include: ['tests/integration/**/*.test.ts'],
        //pool: "forks", // no threads
        maxConcurrency: 5, // Run max 5 concurrent tests at a time
        setupFiles: ['tests/integration/setup.ts'],
        retry: 2,
        reporters: process.env.GITHUB_ACTIONS === 'true'
            ? ['default', 'github-actions']
            : ['default'],
        coverage: {
            enabled: true,
            reportOnFailure: true,
            provider: 'istanbul',
            reporter: ['text', 'html', 'json-summary', 'json'],
            reportsDirectory: './reports/coverage/integration',
            include: ['src/lib/**/*.ts',
                'src/lib/**/*.mjs'],
            thresholds: {
                lines: 5,
                branches: 5,
                functions: 5,
                statements: 5
            }
        },
    }
}));

