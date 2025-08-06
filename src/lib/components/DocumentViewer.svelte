<script lang="ts">
	/**
	 * SOURCE: https://www.nutrient.io/sdk/web/getting-started/svelte/#svelte-local-installation
	 */

	import { onDestroy, onMount } from "svelte";

	let container: HTMLDivElement | null = null;
	let NutrientViewer: typeof import("@nutrient-sdk/viewer").default | undefined;

	export let documentURL: string = "";

	onMount(async () => {
		NutrientViewer = (await import("@nutrient-sdk/viewer")).default;
		if (container && NutrientViewer) {
			if (documentURL.includes("blob")) {
				NutrientViewer.load({
					container,
					document: documentURL,
					baseUrl: `${window.location.protocol}//${window.location.host}/${import.meta.env.PUBLIC_URL ?? ""}`,
				}).then(async instance => {
					// Revoke the object URL when done to free resources
					URL.revokeObjectURL(documentURL);
					// await instance.applyOperations([
					// 	{
					// 		type: 'cropPages',
					// 		pageIndexes: [0], // Crop the first page.
					// 		cropBox: new NutrientViewer!.Geometry.Rect({
					// 			left: 10,
					// 			top: 10,
					// 			width: 100,
					// 			height: 100
					// 		})
					// 	},
					// ]);
					await instance.applyOperations([
						{
							type: 'addPageMargins',
							pageIndexes: [0], // Crop the first page.
							margins: new NutrientViewer!.Geometry.Inset({
								left: 0,   top: 100,   right: 0,   bottom: 5
							})
						},
					]);
				});
			}
			else {
				NutrientViewer.load({
					container,
					document: documentURL,
					baseUrl: `${window.location.protocol}//${window.location.host}/${import.meta.env.PUBLIC_URL ?? ""}`,
				}).then(async instance => {
					await instance.applyOperations([
						{
							type: 'addPageMargins',
							pageIndexes: [0], // Crop the first page.
							margins: new NutrientViewer!.Geometry.Inset({
								left: 0,   top: 100,   right: 0,   bottom: 5
							})
						},
					]);
				});
			}
		}
	});

	onDestroy(() => {
		NutrientViewer?.unload(container);
	});
</script>

<div class="w-full h-[70vh]" bind:this={container}></div>
