import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';

export default defineConfig({
	plugins: [sveltekit(), purgeCss(), enhancedImages()],
	resolve: {
		alias: {
			".prisma/client/index-browser": "./node_modules/.prisma/client/index-browser.js"
		}
	},
	server: {
		hmr: {
			overlay: true, // Enables the error overlay
		},
		watch: {
			usePolling: true, // Use polling if file changes are not detected
		},
	}
});
