// vitest.config.integration.ts
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(viteConfig, defineConfig({
    test: {
        include: ['tests/integration/**/*.test.ts'],
        //pool: "forks", // no threads
        maxConcurrency: 5, // Run max 5 concurrent tests at a time
        setupFiles: ['tests/integration/setup.ts'],
        coverage: {
            enabled: true,
            reporter: ['text'],
            provider: 'istanbul',
            reportsDirectory: './reports/coverage',
            include: ['src/lib/**/*.ts']
        },
    }
}));

