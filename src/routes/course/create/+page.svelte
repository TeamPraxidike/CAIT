<script lang="ts">
	import {
		type Level,
		type User
	} from '@prisma/client';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import MetadataLOandPK from '$lib/components/MetadataLOandPK.svelte';

	let title: string;
	let level: Level;
	let learningObjectives: string[] = [];
	let prerequisites: string[] = [];

	type UserWithProfilePic = User & { profilePicData: string | null};
	let maintainers: UserWithProfilePic[] = [];
	const user = page.data.loggedUser as UserWithProfilePic;

	if (user) {
		maintainers.push(user);
	} else {
		goto('/login');
	}

	const handleInputEnter = (event: KeyboardEvent) => {
		if(event.key === 'Enter'){
			event.preventDefault();
		}
	}
</script>

<form action="?/publish" method="POST" enctype="multipart/form-data"
	  class="col-span-full my-20"
	  use:enhance={async ({ formData }) => {
		formData.append('title', title);
		formData.append('learningObjectives', JSON.stringify(learningObjectives));
		formData.append('prerequisites', JSON.stringify(prerequisites));
    }}>

	<h2 class="text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold">Create a course</h2>

	<hr class="my-10">

	<div class="flex flex-col gap-2 pl-3">
		<label for="title"> Title</label>
		<input minlength="3" type="text" id="title" name="title" bind:value={title} on:keydown={handleInputEnter}
			   class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:ring-0 focus:border-primary-400">
	</div>

	<MetadataLOandPK bind:LOs={learningObjectives} bind:priorKnowledge={prerequisites} adding="{true}"/>
<!--	<MantainersEditBar publisher={user} bind:additionalMaintainers={maintainers} bind:searchableUsers={browsingUsers} bind:users={users}  />-->
	<div class="flex float-right gap-2">
		<button type="submit" class="btn rounded-lg variant-filled-primary text-surface-50 mt-4" on:click={()=>{window.history.back()}}>
			Publish
		</button>
		<button type="button" on:click={()=>{window.history.back()}} class=" flex-none float-right btn rounded-lg variant-filled-surface text-surface-50 mt-4">Cancel</button>
	</div>
</form>