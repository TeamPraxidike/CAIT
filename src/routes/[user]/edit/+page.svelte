<script lang="ts">
	import { Meta } from '$lib';
	import type { LayoutData } from '../$types';
	import type { ActionData } from './$types';
	import { FileButton, getToastStore } from '@skeletonlabs/skeleton';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { onMount, tick } from 'svelte';
	import { downloadFileFromSupabase } from '$lib/util/file';

	/* This is the data that was returned from the server */
	export let data: LayoutData;
	export let form: ActionData;

	let supabaseClient = page.data.supabase;

	let profilePicFetchedData: string | null = data.profilePic
	let profilePicPromise: null | Promise<File> = null;

	onMount(() => {
		// if the data is not null, then we have info about the file
		// so it is no the default, we need to download it
		if (profilePicFetchedData.data){
			profilePicPromise = downloadFileFromSupabase(supabaseClient, profilePicFetchedData);
		}
	});

	const toastStore = getToastStore();
	$: if (form?.status === 400) {
		toastStore.trigger({
			message: `Malformed information, please check your inputs: ${form?.message}`,
			background: 'bg-warning-200',
			classes: 'text-surface-900',

		});
	} else if (form?.status === 500) {
		toastStore.trigger({
			message: 'An error occurred, please try again later or contact support',
			background: 'bg-error-200',
			classes: 'text-surface-900',

		});
	}

	/**
	 * Function to handle the profile picture upload
	 */
	async function choosePfp(e: Event) {
		let input = e.target as HTMLInputElement;
		const eventFiles = input.files;
		if (eventFiles) {
			if (eventFiles[0].type === 'image/jpeg' || eventFiles[0].type === 'image/png') {
				return eventFiles[0];
				// const buffer = await eventFiles[0].arrayBuffer();
				// const base64Image = btoa(String.fromCharCode(...new Uint8Array(buffer)));
				// profilePic = { data: base64Image };
			} else {
				toastStore.trigger({
					message: 'Invalid file type, please upload a .jpg or .png file',
					background: 'bg-warning-200',
					classes: 'text-surface-900',
				});

				return profilePicPromise;
			}

		}

		input.value = '';
	}

	async function chosenPfpPromiseHandler(e: Event){
		profilePicPromise = choosePfp(e);
	}

	const handleInputEnter = (event: KeyboardEvent) => {
		if(event.key === 'Enter'){
			event.preventDefault();
		}
	}

	const defaultProfilePicturePath = "/defaultProfilePic/profile.jpg";

</script>

<Meta title="Profile" description="CAIT" type="site"/>

<h3 class="text-xl mt-8 text-surface-900 col-span-full text-center dark:text-surface-50">
	Edit Profile
</h3>

<form enctype="multipart/form-data" method="POST" action="?/edit" class="col-span-6 flex flex-col gap-8"
	  use:enhance={async ({formData}) => {
		formData.append('userId', data.user.id);

		let profilePic = null;
		if (profilePicPromise !== null){
			profilePic = await profilePicPromise;
		}

		formData.append('profilePicSet', profilePic);
		formData.append('email', data.user.email);
	  }}>

	{#if profilePicPromise !== null}
		<div class="flex gap-8 items-center">
			{#await profilePicPromise}
				<p>Loading profile picture...</p>
			{:then profilePicResolved}
				<div class="flex flex-col items-center">
					<h4 class="text-lg text-surface-900 col-span-3 dark:text-surface-50">
						Profile Picture
					</h4>
					<img src={URL.createObjectURL(profilePicResolved)}
						 class="w-32 h-32 rounded-full" alt="profilePic">
				</div>
				<FileButton on:change={chosenPfpPromiseHandler} name="profilePic" accept="image/*"/>
			{:catch error}
				<p>Error while loading profile picture</p>
			{/await}
		</div>
	{:else}
		<div class="flex gap-8 items-center">
			<div class="flex flex-col items-center">
				<h4 class="text-lg text-surface-900 col-span-3 dark:text-surface-50">
					Profile Picture
				</h4>
				<img src={defaultProfilePicturePath}
					 class="w-32 h-32 rounded-full" alt="profilePic">
			</div>
			<FileButton on:change={chosenPfpPromiseHandler} name="profilePic" accept="image/*"/>
		</div>
	{/if}
	<div>
		<label for="firstName" class="text-surface-900 dark:text-surface-50">
			First name
		</label>
		<input on:keydown={handleInputEnter} minlength="1" type="text" name="firstName" id="firstName" class="input" bind:value={data.user.firstName} />
	</div>
	<div>
		<label for="lastName" class="text-surface-900 dark:text-surface-50">
			Last name
		</label>
		<input on:keydown={handleInputEnter} minlength="1" type="text" name="lastName" id="lastName" class="input" bind:value={data.user.lastName} />
	</div>
	<div>
		<label for="aboutMe" class="text-surface-900 dark:text-surface-50">
			About me
		</label>
		<textarea minlength="1" name="aboutMe" id="aboutMe" class="rounded-lg w-full focus:border-primary-400 focus:ring-0" rows="3" bind:value={data.user.aboutMe} />
	</div>
	<button type="submit" class="btn">Save</button>
</form>
