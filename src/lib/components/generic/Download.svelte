<script lang="ts">
	// export let file: File;
	import type { FetchedFileItem } from '$lib/database';

	export let fileFormat: 'upload' | 'fetch' = 'fetch';
	export let file: FetchedFileItem | File;
	export let className: string = '';

	let href: string = '';

	$: {
		if (fileFormat === 'upload'){
			href = URL.createObjectURL(file as File);
		}
		else{
			// TODO: I don't like this. Need better safeguards/assertions
			href = (file as FetchedFileItem).data ?? '';
		}
	}
</script>

<a	on:click|stopPropagation
	type="button"
	href={href}
	download={file.name}
	class={className}>
	<slot />
</a>