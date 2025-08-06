import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
// import copy from 'rollup-plugin-copy';

import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
	plugins: [
		sveltekit(), purgeCss(), enhancedImages(),
		viteStaticCopy({
			targets: [
				{
					src: "node_modules/@nutrient-sdk/viewer/dist/nutrient-viewer-lib",
					dest: "static/",
				},
			]
		}),
	],
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
