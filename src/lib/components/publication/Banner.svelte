<script lang="ts">
import Icon from '@iconify/svelte';

type Metadata = {
	title?: string;
	description?: string;
	tags?: string[];
	learningObjectives?: string[];
};

export let metadata: Metadata;

// those values are given some values by default that make them not appear in the banner
// If you dont pass anything to them, they will be considered as filled
export let files = 1;
export let numNodes = 2
export let materialType = ['slides'];

$: hasTitle = metadata && metadata.title && metadata.title.trim() !== '';
$: hasTags = metadata && metadata.tags && metadata.tags.length > 0;
$: hasLOs = metadata && metadata.learningObjectives && metadata.learningObjectives.length > 0;

export let fieldsList = []

$: fieldsList = [
		files <= 0 && 'File',
		numNodes <= 1 && '2 Nodes',
		!hasTitle && 'Title',
		!hasTags && 'Tags',
		!hasLOs && 'Learning Objectives',
		materialType.length <= 0 && 'Material Type'
	].filter(Boolean);


$: show = true;
</script>

{#if show && fieldsList.length > 0}
	<div class="relative bg-yellow-100 border border-yellow-300 text-yellow-900 text-sm p-3 shadow-sm flex items-start justify-between">
		<div class="flex items-start space-x-2 w-full max-w-7xl mx-auto">
			<Icon icon="mdi:warning-outline" class="w-5 h-5 mt-0.5 text-yellow-600" />
			<div class="flex-1">
				<p class="font-medium">This material will be saved as a draft.</p>
				<p class="mt-1 text-sm">Complete the following to publish: <span class="font-semibold">{fieldsList.join(', ')}</span></p>
			</div>
		</div>
		<button on:click={() => show = false} class="text-yellow-700 hover:text-yellow-900 transition px-3">
			✕
		</button>
	</div>
{/if}
