<script lang="ts">
	import { FileTable, Tag, UserProp } from '$lib';
	import type { FileTUSMetadata } from '$lib/util/indexDB.ts';
	import type { UserWithProfilePic } from '$lib/util/coursesLogic.ts';

	export let title: string = '';
	export let tags: string[] = [];
	export let description: string = '';
	export let estimate: number | null = null;
	export let selectedType: string = 'Select type';
	export let coverPic: File | undefined = undefined;
	export let files: FileList = [] as unknown as FileList;
	export let fileURLs: string[] = [] as string[];
	export let fileTUSMetadata: { [key: string] : FileTUSMetadata } = {};
	export let fileTUSProgress: { [key: string]: any } = {};
	export let fileTUSUploadObjects: { [key: string]: any } = {};
	export let supabaseClient: any;
	export let loggedUser: UserWithProfilePic;
	export let maintainers: UserWithProfilePic[] = [];
	export let LOs: string[] = [];
	export let PKs: string[] = [];
	export let copyright: string = '';
	export let draft: boolean = false;
	export let markedAsDraft: boolean = false;
</script>

<div class="grid grid-cols-12 gap-8">
	<div class="col-span-8 flex flex-col">
		<h2 class="text-3xl font-semibold break-words">{title}</h2>

		<div class="flex flex-wrap gap-2 text-sm my-2">
			{#each tags as tag}
				<Tag tagText="{tag}" removable="{false}" width="{12}" />
			{/each}
		</div>

		<p class="text-surface-800 text-sm">{description}</p>

		<p class="text-surface-500 text-sm">
			Time Estimate: {estimate || 'No estimate provided'} |
			Type: {selectedType?.toUpperCase() || 'No type provided'}
		</p>

		<FileTable operation="view" fileFormat="upload" bind:files={files} bind:fileURLs={fileURLs}
				   bind:fileTUSMetadata={fileTUSMetadata} bind:fileTUSProgress={fileTUSProgress}
				   bind:fileTUSUploadObjects={fileTUSUploadObjects} bind:supabaseClient={supabaseClient}/>
	</div>
	<div class="col-span-4 flex flex-col gap-4">
		{#if coverPic}
			<p class="font-bold"> Cover Picture: </p>
			<img src={URL.createObjectURL(coverPic)} alt="">
		{/if}
		<div class="flex flex-col">
			<span class="font-bold">Maintainers:</span>
			<div class="flex flex-wrap">
				<UserProp role="Publisher" view="publish" user={loggedUser} userPhotoUrl={loggedUser.profilePicData} />
				{#each maintainers as maintainer (maintainer.id)}
					<UserProp user={maintainer} view="publish" role="Publisher" userPhotoUrl={maintainer.profilePicData} />
				{/each}
			</div>
		</div>
		<div class="flex flex-col">
			<span class="font-bold">Learning Objectives:</span>
			<ul class="list-inside">
				{#each LOs as lo}
					<li class="list text-sm list-disc">{lo}</li>
				{/each}
			</ul>
		</div>
		<div class="flex flex-col">
			<span class="font-bold">Prior Knowledge:</span>
			<ul class="list-inside">
				{#each PKs as pk}
					<li class="list text-sm list-disc">{pk}</li>
				{/each}
			</ul>
		</div>
		<div class="flex flex-col">
			<span class="font-bold">Copyright:</span>
			<span class="text-sm">{copyright || 'No copyright license'}</span>
		</div>
	</div>
</div>

{#if !draft}
	<div class="flex flex-row justify-end items-center gap-2">
		<p class="pl-3">Save as a draft: </p>
		<input type="checkbox" bind:checked={markedAsDraft} class="toggle toggle-primary" />
	</div>
{/if}