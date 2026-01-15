<script lang="ts">
	import { FileTable, Tag, UserProp } from '$lib';
	import type { FileTUSMetadata } from '$lib/util/indexDB.ts';
	import type { UserWithProfilePic } from '$lib/util/coursesLogic.ts';
	import type { ParamsImmutable, ParamsMutable } from '$lib/util/frontendTypes.ts';

	export let data: ParamsMutable;
	export let paramsImmutable: ParamsImmutable;

	export let draft: boolean;
	export let markedAsDraft: boolean;
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

		<p class="text-surface-500 text-sm">
			Time Estimate: {data.estimate || 'No estimate provided'} |
			Type: {data.selectedTypes[0]?.toUpperCase() || 'No type provided'}
		</p>

		<FileTable operation="view" fileFormat="upload" bind:files={data.files} bind:fileURLs={data.fileURLs}
				   bind:fileTUSMetadata={data.fileTUSMetadata} bind:fileTUSProgress={data.fileTUSProgress}
				   bind:fileTUSUploadObjects={data.fileTUSUploadObjects} bind:supabaseClient={paramsImmutable.supabaseClient}/>
	</div>
	<div class="col-span-4 flex flex-col gap-4">
		{#if data.coverPic}
			<p class="font-bold"> Cover Picture: </p>
			<img src={URL.createObjectURL(data.coverPic)} alt="">
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
		<div class="flex flex-col">
			<span class="font-bold">Learning Objectives:</span>
			<ul class="list-inside">
				{#each data.LOs as lo}
					<li class="list text-sm list-disc">{lo}</li>
				{/each}
			</ul>
		</div>
		<div class="flex flex-col">
			<span class="font-bold">Prior Knowledge:</span>
			<ul class="list-inside">
				{#each data.PKs as pk}
					<li class="list text-sm list-disc">{pk}</li>
				{/each}
			</ul>
		</div>
		<div class="flex flex-col">
			<span class="font-bold">Copyright:</span>
			<span class="text-sm">{data.copyright || 'No copyright license'}</span>
		</div>
	</div>
</div>

<div class="mt-4">
	<label class="label">
		<span class="font-bold">Comment on changes (Optional)</span>
		<textarea class="textarea" rows="3" placeholder="Describe the changes made..." bind:value={data.globalComment}></textarea>
	</label>
</div>

{#if !draft}
	<div class="flex flex-row justify-end items-center gap-2">
		<p class="pl-3">Save as a draft: </p>
		<input type="checkbox" bind:checked={markedAsDraft} class="toggle toggle-primary" />
	</div>
{/if}
