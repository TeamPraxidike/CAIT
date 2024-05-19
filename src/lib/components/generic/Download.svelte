<script lang="ts">
	export let file: File;
	export let className: string = '';
</script>

<a	type="button"
	href={URL.createObjectURL(file)}
	download={file.name}
	class={className}>
	<slot />
</a>