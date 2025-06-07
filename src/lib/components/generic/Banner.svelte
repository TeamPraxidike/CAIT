<script lang="ts">
import Icon from '@iconify/svelte';

type Metadata = {
	title?: string;
	description?: string;
	tags?: string[];
	learningObjectives?: string[];
	materialType?: string;
};

export let metadata: Metadata;
export let files = 1;
$: hasTitle = metadata && metadata.title && metadata.title.trim() !== '';
$: hasDescription = metadata && metadata.description && metadata.description.trim() !== '';
$: hasTags = metadata && metadata.tags && metadata.tags.length > 0;
$: hasLOs = metadata && metadata.learningObjectives && metadata.learningObjectives.length > 0;
$: hasType = metadata && metadata.materialType && metadata.materialType !== 'Select Type';

$: fieldsList = [
		files <= 0 && 'File',
		!hasTitle && 'Title',
		!hasDescription && 'Description',
		!hasTags && 'Tags',
		!hasLOs && 'Learning Objectives',
		!hasType && 'Material Type'
	].filter(Boolean).join(', ');

$: show = true;
</script>

{#if show && fieldsList.length > 0}
	<div class="absolute left-0 right-0 bg-yellow-100 border border-yellow-300 text-yellow-900 text-sm p-3 shadow-sm flex items-start justify-between z-40">
		<div class="flex items-start space-x-2 w-full max-w-7xl mx-auto">
			<Icon icon="mdi:warning-outline" class="w-5 h-5 mt-0.5 text-yellow-600" />
			<div class="flex-1">
				<p class="font-medium">This material will be saved as a draft.</p>
				<p class="mt-1 text-sm">Complete the following to publish: <span class="font-semibold">{fieldsList}</span></p>
			</div>
		</div>
		<button on:click={() => show = false} class="text-yellow-700 hover:text-yellow-900 transition px-3">
			✕
		</button>
	</div>
{/if}
