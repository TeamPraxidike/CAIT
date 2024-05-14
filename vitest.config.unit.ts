import { defineConfig, mergeConfig } from 'vitest/config';
import { svelteTesting } from '@testing-library/svelte/vite';
import viteConfig from './vite.config';

export default mergeConfig(
	viteConfig,
	defineConfig({
		plugins: [svelteTesting()],
		test: {
			include: ['tests/unit/**/*.test.ts'],
			environment: 'jsdom',
			setupFiles: ['tests/unit/setup.ts'],
			coverage: {
				enabled: true,
				reporter: ['cobertura'],
				provider: 'istanbul',
				reportsDirectory: './reports/coverage',
				include: ['src/lib/**/*.ts'],
			},
		},
	}),
);
