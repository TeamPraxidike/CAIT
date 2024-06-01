<script lang="ts">
	import { Meta } from '$lib';
	import type { LayoutData } from '../$types';
	import type { ActionData } from './$types';
	import type { Publication, Tag, User } from '@prisma/client';
	import { FileButton, getToastStore } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	/* This is the data that was returned from the server */
	export let data: LayoutData;
	export let form: ActionData;

	let user: User & {
		posts: Publication & {
			tags: Tag[];
		}[]
	} = data.user;

	$:profilePic = data.profilePicData;


	const toastStore = getToastStore();
	$: if (form?.status === 200) {
		toastStore.trigger({
			message: 'User Edited successfully',
			background: 'bg-success-200'
		});
		goto(`/${$page.data.session?.user.id}/${form?.id}`);
	} else if (form?.status === 400) {
		toastStore.trigger({
			message: `Malformed information, please check your inputs: ${form?.message}`,
			background: 'bg-warning-200'
		});
	} else if (form?.status === 500) {
		toastStore.trigger({
			message: 'An error occurred, please try again later or contact support',
			background: 'bg-error-200'
		});
	}

	/**
	 * Function to handle the profile picture upload
	 */
	async function choosePfp(e: Event) {
		const eventFiles = (e.target as HTMLInputElement).files;
		if (eventFiles) {
			if (eventFiles[0].type === 'image/jpeg' || eventFiles[0].type === 'image/png') {
				const buffer = await eventFiles[0].arrayBuffer();
				const base64Image = btoa(String.fromCharCode(...new Uint8Array(buffer)));
				profilePic = { data: base64Image };
			} else
				toastStore.trigger({
					message: 'Invalid file type, please upload a .jpg or .png file',
					background: 'bg-warning-200'
				});
		}
	}
</script>

<Meta title="Profile" description="CAIT" type="site" />

<h3 class="text-xl mt-8 text-surface-900 col-span-full text-center dark:text-surface-50">
	Edit Profile
</h3>

<form enctype="multipart/form-data" method="POST" action="?/edit" class="col-span-6 flex flex-col gap-8"
	  use:enhance={({formData}) => {
		formData.append('userId', user.id.toString());
	  }}>

	<div class="flex gap-8 items-center">
		<div class="flex flex-col items-center">
			<h4 class="text-lg text-surface-900 col-span-3 dark:text-surface-50">
				Profile Picture
			</h4>
			<img src={'data:image;base64,' + profilePic.data} alt="" class="w-32 h-32 rounded-full" />
		</div>
		<FileButton on:click={choosePfp} name="profilePic" accept="image/*" />
	</div>
	<div>
		<label for="firstName" class="text-surface-900 dark:text-surface-50">
			First name
		</label>
		<input type="text" name="firstName" id="firstName" class="input" value={user.firstName} />
	</div>
	<div>
		<label for="lastName" class="text-surface-900 dark:text-surface-50">
			Last name
		</label>
		<input type="text" name="lastName" id="lastName" class="input" value={user.lastName} />
	</div>
	<div>
		<label for="email" class="text-surface-900 dark:text-surface-50">
			Email
		</label>
		<input type="text" name="email" id="email" class="input" value={user.email} />
	</div>
	<button type="submit" class="btn">Edit</button>
</form>
