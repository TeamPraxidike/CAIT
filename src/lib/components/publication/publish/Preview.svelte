<script lang="ts">
	import type { ParamsImmutable, ParamsMutable, ParamsMutableMaterial } from '$lib/util/frontendTypes.ts';
	import List from '$lib/components/publication/preview/List.svelte';
	import { FileTable, Tag, UserProp, RichTextEditor } from '$lib';
	import { mentionSuggestion } from '$lib/components/generic/mentionSuggestion';
	import type { FileTUSMetadata } from '$lib/util/indexDB.ts';
	import type { UserWithProfilePic } from '$lib/util/coursesLogic.ts';

	export let data: ParamsMutable;
	export let dataMaterial: ParamsMutableMaterial | null;
	export let paramsImmutable: ParamsImmutable;

	export let isCircuit = dataMaterial == null;

	export let draft: boolean;
	export let markedAsDraft: boolean;

	let editorRef: RichTextEditor;

	/**
	 * Sync the editor content back to `data.globalComment` on every keystroke
	 * so that PublishWorkflow can read it at submit time without needing a
	 * direct reference to the editor.
	 *
	 * NOTE: This has a performance hit because we are calling getJSON() on every keystroke, but since our comment is probably small this should not be noticeable
	 */
	function handleEditorUpdate() {
		if (!editorRef) return;
		const json = editorRef.getJSON();
		data.globalComment = json as object ?? { type: 'doc', content: [] };
	}
</script>

<div class="grid grid-cols-12 gap-8">
	<div class="col-span-8 flex flex-col">
		<h2 class="text-3xl font-semibold break-words">{data.title}</h2>

		<div class="flex flex-wrap gap-2 text-sm my-2">
			{#each data.tags as tag}
				<Tag tagText="{tag}" removable="{false}" width="{12}" />
			{/each}
		</div>

		<p class="text-surface-800 text-sm">{data.description}</p>

		{#if !isCircuit && dataMaterial}
			<p class="text-surface-500 text-sm">
				Time Estimate: {dataMaterial.estimate || 'No estimate provided'} |
				Type: {dataMaterial.selectedTypes[0]?.toUpperCase() || 'No type provided'}
			</p>

			<FileTable operation="view" fileFormat="upload" bind:files={dataMaterial.files} bind:fileURLs={dataMaterial.fileURLs}
					   bind:fileTUSMetadata={dataMaterial.fileTUSMetadata} bind:fileTUSProgress={dataMaterial.fileTUSProgress}
					   bind:fileTUSUploadObjects={dataMaterial.fileTUSUploadObjects} bind:supabaseClient={paramsImmutable.supabaseClient}/>
		{/if}
	</div>
	<div class="col-span-4 flex flex-col gap-4">
		{#if dataMaterial && dataMaterial.coverPic}
			<p class="font-bold"> Cover Picture: </p>
			<img src={URL.createObjectURL(dataMaterial.coverPic)} alt="">
		{/if}
		<div class="flex flex-col">
			<span class="font-bold">Maintainers:</span>
			<div class="flex flex-wrap">
				<UserProp role="Publisher" view="publish" user={data.loggedUser} userPhotoUrl={data.loggedUser.profilePicData} />
				{#each data.maintainers as maintainer (maintainer.id)}
					<UserProp user={maintainer} view="publish" role="Publisher" userPhotoUrl={maintainer.profilePicData} />
				{/each}
			</div>
		</div>
		<List list={data.LOs} isLO={true} />
		<List list={data.PKs} isLO={false} />
		{#if !isCircuit}
			<div class="flex flex-col">
				<span class="font-bold">Copyright:</span>
				<span class="text-sm">{dataMaterial?.copyright || 'No copyright license'}</span>
			</div>
		{/if}
	</div>
</div>

<div class="mt-4">
	<label class="label">
		<span class="font-bold">Comment on changes (Optional)</span>
		<RichTextEditor
			bind:this={editorRef}
			placeholder="Describe the changes made..."
			content={data.globalComment ? JSON.stringify(data.globalComment) : ''}
			{mentionSuggestion}
			editorClass="min-h-[80px]"
			on:update={handleEditorUpdate}
		/>
	</label>
</div>

{#if !draft}
	<div class="flex flex-row justify-end items-center gap-2">
		<p class="pl-3">Save as a draft: </p>
		<input type="checkbox" bind:checked={markedAsDraft} class="toggle toggle-primary" />
	</div>
{/if}
