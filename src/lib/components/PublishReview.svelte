<script lang="ts">
	import type { Difficulty, User } from '@prisma/client';
	import { DiffBar, FileTable, Tag, TheoryAppBar, UserProp } from '$lib';
	import MetadataLOandPK from '$lib/components/MetadataLOandPK.svelte';

	type UserWithProfilePic = User & { profilePicData: string };

	export let title:string;
	export let description: string;
	export let tags: string[];
	export let LOs: string[];
	export let prior: string[];
	export let maintainers: UserWithProfilePic[];


</script>

<div class="flex flex-col gap-2 pl-3">
	<h2 class="text-2xl max-w-full break-words">Title: <br> {title}</h2>
	<p class="text-lg break-words max-w-full">Description: <br> {description}</p>
</div>

<p class="text-lg pl-3">Tags: </p>
<div class="flex flex-wrap gap-2 pl-3">
	{#each tags as tag}
		<Tag tagText="{tag}" removable="{false}" width="{12}" />
	{/each}
</div>

<MetadataLOandPK bind:LOs={LOs} bind:priorKnowledge={prior} adding="{false}"/>

<p class="text-lg pl-3">Maintainers:</p>
<div class="flex flex-wrap gap-2 pl-3">
	{#each maintainers as maintainer (maintainer.id)}
		<UserProp user={maintainer} view="publish"
							role="Publisher" userPhotoUrl={'data:image;base64,' + maintainer.profilePicData} />
	{/each}
</div>










