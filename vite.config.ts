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
		watch: {
			usePolling: true,  // Ensures changes are detected in some environments (e.g., WSL, Docker)
		},
		hmr: {
			overlay: false,  // Prevents the error overlay (optional)
		}
	},
});
