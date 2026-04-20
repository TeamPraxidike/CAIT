import { defineConfig, mergeConfig } from 'vitest/config';
import { svelteTesting } from '@testing-library/svelte/vite';
import viteConfig from './vite.config';

export default mergeConfig(
	viteConfig,
	defineConfig({
		plugins: [svelteTesting()],
		test: {
			include: ['tests/unit/**/*.test.ts'],
			exclude: ['DOCKER/**'],
			reporters: process.env.GITHUB_ACTIONS === 'true'
				? ['default', 'github-actions']
				: ['default'],
			environment: 'jsdom',
			setupFiles: ['tests/unit/setup.ts'],
			coverage: {
				enabled: true,
				reportOnFailure: true,
				reporter: ['text', 'html', 'json-summary', 'json'],
				reportsDirectory: './reports/coverage/unit',
				provider: 'istanbul',
				include: ['src/lib/**/*.ts'],
				thresholds: {
					lines: 80,
					branches: 80,
					functions: 80,
					statements: 80
				}
			},
		},
	}),
);
