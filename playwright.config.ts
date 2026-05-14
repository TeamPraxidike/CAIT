import type { PlaywrightTestConfig } from '@playwright/test';

const isCI = !!process.env.CI;

const config: PlaywrightTestConfig = {
	// isCI gets set automatically by the github worker in CI/CD, otherwise resort to a local setup
	use: {
		baseURL: isCI ? process.env.STAGING_URL : 'http://localhost:4173',
	},
	testDir: 'tests/e2e',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	workers: 1,
	// source: https://playwright.dev/docs/test-reporters
	reporter: isCI
		? [['github'], ['html', { open: 'never' }]]
		: [['list'], ['html', { open: 'never' }]],
};

export default config;
