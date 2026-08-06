import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
	// isCI gets set automatically by the github worker in CI/CD, otherwise resort to a local setup
	use: {
		baseURL: isCI ? process.env.STAGING_URL : 'http://localhost:4173',
		trace: 'on-first-retry',
	},
	expect: { timeout: isCI ? 10_000 : 5_000 },
	retries: isCI ? 1 : 0,
	testDir: 'tests/e2e',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	workers: 1,
	// source: https://playwright.dev/docs/test-reporters
	reporter: isCI
		? [['github'], ['html', { open: 'never' }]]
		: [['list'], ['html', { open: 'never' }]],
	projects: [
		{
			name: 'setup',
			testMatch: /.*\.setup\.ts/
		},
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
			dependencies: ['setup']
		}
	]
});