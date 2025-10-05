<script lang="ts">
	import TimeEstimate from '$lib/components/publication/TimeEstimate.svelte';
	import MetadataLOandPK from '$lib/components/MetadataLOandPK.svelte';
	import MantainersEditBar from '$lib/components/user/MantainersEditBar.svelte';
	import TagsSelect from '$lib/components/TagsSelect.svelte';
	import type { UserWithProfilePic } from '$lib/util/coursesLogic.ts';
	import type {  Tag as PrismaTag } from '@prisma/client';

	export let estimate: number = 0;
	export let copyright: string = '';
	export let LOs: string[] = [];
	export let PKs: string[] = [];
	export let maintainers: UserWithProfilePic[] = [];
	export let loggedUser: UserWithProfilePic;
	export let searchableUsers: UserWithProfilePic[] = [];
	export let users: UserWithProfilePic[] = [];
	export let allTags: PrismaTag[] = [];
	export let tags: string[] = [];
	export let newTags: string[] = [];
	export let description: string = '';

	const handleInputEnter = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			event.preventDefault();
		}
	};
</script>

<div class="flex flex-col gap-6 mt-3">
	<div class="flex flex-col md:flex-row col-span-full items-center gap-10">
		<TimeEstimate bind:totalMinutes={estimate}/>
		<div class="w-full md:w-1/2	">
			<label for="copyright md-2" class="block font-medium">Copyright License (<a
				href="https://www.tudelft.nl/library/support/copyright#c911762" target=”_blank”
				class="text-tertiary-700"> Check here how this applies to you</a>):</label>
			<input type="text" name="copyright" bind:value={copyright} on:keydown={handleInputEnter}
				   placeholder="Leave blank if material is your own"
				   class="mt-1 rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:border-primary-500 focus:ring-0">
		</div>
	</div>
	<div class="w-full">
		<MetadataLOandPK bind:LOs={LOs} bind:priorKnowledge={PKs}
						 adding="{true}"/>
	</div>
	<div class="w-full">
		<MantainersEditBar publisher={loggedUser} bind:searchableUsers={searchableUsers} users={users}
						   bind:additionalMaintainers={maintainers} />
	</div>
	<div class="lg:w-1/2">
		<TagsSelect allTags={allTags} bind:tags={tags} bind:newTags={newTags}/>
	</div>

	<textarea name="description" placeholder="Additional Description..." bind:value={description}
			  class="min-h-60 rounded-lg h-full resize-y dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-200 focus:border-primary-500 focus:ring-0" />
</div>