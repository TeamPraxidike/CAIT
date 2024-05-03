import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), purgeCss()],
	test: {
		coverage: {
			enabled: true,
			reporter: ['cobertura'],
			provider: 'istanbul',
			reportsDirectory: './reports/coverage',
		},
	}
});