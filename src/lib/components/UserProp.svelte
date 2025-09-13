<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { popup } from '@skeletonlabs/skeleton';
	import type { User } from '@prisma/client';
	import type { PopupSettings } from '@skeletonlabs/skeleton';


	export let view: 'home' | 'publish' | 'material' | 'search';
	export let user: User;
	export let posts = 0;
	export let userPhotoUrl: string | null;
	export let role: 'Maintainer' | 'Publisher' | null;
	export let className: string = 'col-span-2';

	const defaultProfilePicturePath = "/defaultProfilePic/profile.jpg"

	const randomNumber = Math.floor(Math.random() * 1000);
	let hoverName = '' + user.id + randomNumber;

	const popupHoverTop: PopupSettings = {
		event: 'hover',
		target: hoverName,
		placement: 'top',
		middleware: {
			offset: 2
		}
	};
	const dispatch = createEventDispatcher();
	export const removeMaintainer = () => {
		dispatch('removeMaintainer', { value: user });
	};
</script>
<span
	class="group-hover:block hidden rounded dark:bg-surface-600 dark:text-surface-50 bg-surface-50 text-surface-800 bg-opacity-100 shadow-md"
	style="z-index:9999" data-popup={hoverName}>
    {user.firstName + " " + user.lastName}
</span>

{#if view === "search"}
	<a href='/{user.username}' style="height:fit-content"
	   class="{className} flex md:h-60 text-surface-800 dark:text-surface-50 overflow-hidden card dark:bg-surface-700 p-2 md:p-3  card-hover bg-surface-50 hover:cursor-pointer rounded-lg hover:shadow-lg shadow">
		<div class="flex flex-col space-y-1 items-start w-full md:pb-2">
			<div class="w-full flex flex-col items-center">
				{#if userPhotoUrl !== null}
					<img src={userPhotoUrl} alt="User Profile" class="w-10 h-10 md:w-20 md:h-20 rounded-full object-cover" />
				{:else}
					<img src={defaultProfilePicturePath} alt="User Profile" class="w-10 h-10 md:w-20 md:h-20 rounded-full object-cover" />
				{/if}
				<div class="max-w-full items-center">
					<span class="dark:text-surface-50 text-surface-900 max-w-full truncate md:text-2xl"
						 use:popup={popupHoverTop}>{user.firstName.slice(0,1) + ". " + user.lastName}</span>
					<hr class="dark:bg-surface-50 bg-surface-300" />
				</div>
			</div>
			<div class="flex justify-between items-start w-full">
				<span class="dark:text-surface-50 text-surface-800 text-xs md:text-sm">Rep: {user.reputation}</span>
				<span class="dark:text-surface-50 text-surface-800 text-xs md:text-sm">Posts: {posts}</span>
			</div>
		</div>
	</a>

{:else if view === "material"}

	<a href='/{user.username}' type="button" style="height:fit-content"
		 class="[&>*]:pointer-events-none md:col-span-1 overflow-hidden card dark:bg-surface-700 p-2 card-hover
		 		bg-surface-50 hover:cursor-pointer rounded-lg w-full">
		<div class="flex gap-2 items-center space-y-1 w-full flex-none">
			{#if userPhotoUrl !== null}
				<img src={userPhotoUrl} alt="User Profile" class="w-10 h-10 rounded-full" />
			{:else}
				<img src={defaultProfilePicturePath} alt="User Profile" class="w-10 h-10 rounded-full" />
			{/if}
			<div class="max-w-full items-center flex-none">
				<span class="dark:text-surface-50 text-surface-900 max-w-full truncate flex-none">{user.firstName.slice(0,1) + ". " + user.lastName}</span>
				<hr class="dark:bg-surface-50 bg-surface-300" />
				<div class="text-sm md:text-md ">{role}</div>
			</div>
		</div>
	</a>

{:else if view === "publish"}
	<div class="flex relative text-surface-800 dark:text-surface-50 overflow-hidden
		 		p-2 rounded-lg text-sm">
		{#if role!=="Publisher"}
			<button type="button" on:click={removeMaintainer} class="absolute top-0 right-0 rounded-lg hidden group-hover:block">
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36" {...$$props}>
					<path fill="#EB0000"
								d="m19.61 18l4.86-4.86a1 1 0 0 0-1.41-1.41l-4.86 4.81l-4.89-4.89a1 1 0 0 0-1.41 1.41L16.78 18L12 22.72a1 1 0 1 0 1.41 1.41l4.77-4.77l4.74 4.74a1 1 0 0 0 1.41-1.41Z"
								class="clr-i-outline clr-i-outline-path-1" />
					<path fill="#EB0000"
								d="M18 34a16 16 0 1 1 16-16a16 16 0 0 1-16 16m0-30a14 14 0 1 0 14 14A14 14 0 0 0 18 4"
								class="clr-i-outline clr-i-outline-path-2" />
					<path fill="none" d="M0 0h36v36H0z" />
				</svg>
			</button>
		{/if}
		<div class="w-full flex gap-2 items-center flex-none">
			{#if userPhotoUrl !== null}
				<img src={userPhotoUrl} alt="User Profile" class="w-7 h-7 rounded-full" />
			{:else}
				<img src={defaultProfilePicturePath} alt="User Profile" class="w-7 h-7 border border-1 border-gray-300 rounded-full" />
			{/if}
			<div class="max-w-full items-center">
				<span class="dark:text-surface-50 text-surface-900 max-w-full truncate">{user.firstName + " " + user.lastName}</span>
			</div>
		</div>
	</div>

{:else }
	<a href='/{user.username}' use:popup={popupHoverTop}
	   class="[&>*]:pointer-events-none flex-none col-span-2 h-20 text-surface-800 dark:text-surface-50 overflow-hidden card dark:bg-surface-700 pl-2 pr-2 card-hover bg-surface-50 hover:cursor-pointer rounded-lg hover:shadow-lg shadow hover:ring-1 hover:ring-primary-600 hover:ring-opacity-20r">
		<div class="flex space-x-2 items-center w-full">
			{#if userPhotoUrl !== null}
				<img src={userPhotoUrl} alt="User Profile" class="w-10 h-10 md:w-28 md:h-28 rounded-full" />
			{:else}
				<img src={defaultProfilePicturePath} alt="User Profile" class="w-10 h-10 md:w-28 md:h-28 rounded-full" />
			{/if}
			<div class="flex flex-col items-start w-4/5">
				<div class="w-full items-center">
					<span class="dark:text-surface-50 text-surface-900 max-w-[80%] truncate">{user.firstName.slice(0,1) + ". " + user.lastName}</span>
					<hr class="dark:bg-surface-50 bg-surface-300 max-w-[80%]" />
				</div>
				<span>Rep: {user.reputation}</span>
				<span>Posts: {posts}</span>
			</div>
		</div>
	</a>

{/if}