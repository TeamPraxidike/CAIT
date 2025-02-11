<script lang="ts">
	import { Meta } from '$lib';
	import type { LayoutData } from '../$types';
	import type { ActionData } from './$types';
	import type { Publication, Tag, User } from '@prisma/client';
	import { FileButton, getToastStore } from '@skeletonlabs/skeleton';
	import { enhance } from '$app/forms';
	import { base64ToFile } from '$lib/util/file';
	import { goto } from '$app/navigation';

	/* This is the data that was returned from the server */
	export let data: LayoutData;
	export let form: ActionData;

	let user: User & {
		posts: Publication & {
			tags: Tag[];
		}[]
	} = data.user;


	let profilePic = data.profilePicData.data
		? base64ToFile(data.profilePicData.data, 'cover.jpg', 'image/jpeg')
		: null
	//$:profilePic = data.profilePicData;

	const toastStore = getToastStore();
	$: if (form?.status === 200) {
		toastStore.trigger({
			message: 'User Edited Successfully',
			background: 'bg-success-200',
			classes: 'text-surface-900',
		});
		goto(`/${form?.username}`);
	} else if (form?.status === 400) {
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
		const eventFiles = (e.target as HTMLInputElement).files;
		if (eventFiles) {
			if (eventFiles[0].type === 'image/jpeg' || eventFiles[0].type === 'image/png') {
				profilePic = eventFiles[0]
				// const buffer = await eventFiles[0].arrayBuffer();
				// const base64Image = btoa(String.fromCharCode(...new Uint8Array(buffer)));
				// profilePic = { data: base64Image };
			} else
				toastStore.trigger({
					message: 'Invalid file type, please upload a .jpg or .png file',
					background: 'bg-warning-200',
					classes: 'text-surface-900',

				});
		}
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
	  use:enhance={({formData}) => {
		formData.append('userId', user.id);
		formData.append('profilePicSet', profilePic);
		formData.append('email', user.email);
	  }}>

	<div class="flex gap-8 items-center">
		<div class="flex flex-col items-center">
			<h4 class="text-lg text-surface-900 col-span-3 dark:text-surface-50">
				Profile Picture
			</h4>
			<!--{#if profilePic}-->
			<!--	<img src={URL.createObjectURL(profilePic)} class="w-32 h-32 rounded-full" alt="profilePic">-->
			<!--{/if}-->
			<img src={profilePic ? URL.createObjectURL(profilePic) : defaultProfilePicturePath}
				 class="w-32 h-32 rounded-full" alt="profilePic">
		</div>
		<FileButton on:change={choosePfp} name="profilePic" accept="image/*"/>
	</div>
	<div>
		<label for="firstName" class="text-surface-900 dark:text-surface-50">
			First name
		</label>
		<input on:keydown={handleInputEnter} minlength="1" type="text" name="firstName" id="firstName" class="input" bind:value={user.firstName} />
	</div>
	<div>
		<label for="lastName" class="text-surface-900 dark:text-surface-50">
			Last name
		</label>
		<input on:keydown={handleInputEnter} minlength="1" type="text" name="lastName" id="lastName" class="input" bind:value={user.lastName} />
	</div>
	<div>
		<label for="email" class="text-surface-900 dark:text-surface-50">
			Email
		</label>
		<p class="bg-surface-200 rounded-full border-1 border-surface-700 p-2	">
			{user.email}
		<p/>
	</div>
	<div>
		<label for="aboutMe" class="text-surface-900 dark:text-surface-50">
			About me
		</label>
		<textarea minlength="1" name="aboutMe" id="aboutMe" class="rounded-lg w-full focus:border-primary-400 focus:ring-0" rows="3" bind:value={user.aboutMe} />
	</div>
	<button type="submit" class="btn">Save</button>
</form>
