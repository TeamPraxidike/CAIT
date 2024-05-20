<script lang="ts">
	import type { LayoutServerData } from './$types';
	import { DiffBar, getDateDifference, Meta, Tag, FileTable, Comment, authStore, AddInteractionForm } from '$lib';
	import { onMount } from 'svelte';
	import JSZip from 'jszip';
	import Icon from '@iconify/svelte';
	import type { PublicationViewLoad } from './+layout.server';
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { createFileList } from '$lib/util/file';

	const toastStore = getToastStore();
	const modalStore = getModalStore();
	export let data: LayoutServerData;
	let serverData: PublicationViewLoad = data.loadedPublication;

	let files: FileList = createFileList(serverData.fileData, serverData.material.files);

	let liked: boolean = true;
	let saved: boolean = true;
	$:likedColor = liked ? 'text-secondary-500' : 'text-surface-500';
	$:savedColor = saved ? 'text-secondary-500' : 'text-surface-500';
	const toggleLike = () => liked = !liked;
	const toggleSave = () => saved = !saved;

	let tags: string[] = serverData.material.publication.tags.map(tag => tag.content);

	let created: string;
	$:created = getDateDifference(serverData.material.publication.createdAt, new Date());

	onMount(() => {
		created = getDateDifference(serverData.material.publication.createdAt, new Date());

	});

	async function deletePublication() {
		const url = '/api/material/' + serverData.material.publicationId;
		try {
			await fetch(url, {
				method: 'DELETE'
			}).then(() => {
				toastStore.trigger({
					message: 'Publication deleted successfully',
					background: 'bg-success-200'
				});
				goto('/browse');
			});
		} catch (e) {
			console.error(e);
		}
	}

	function promptForDeletion() {
		modalStore.trigger({
			type: 'confirm',
			title: 'Delete Publication',
			body: 'Are you sure you want to delete this publication?',
			response: (r: boolean) => {
				if (r) deletePublication();
			}
		});
	}

	async function downloadFiles() {
		const zip = new JSZip();

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const blob = await file.arrayBuffer();
			zip.file(file.name, blob);
		}

		//this is for zipping that gave error before, comment out to test my implementation
		//const content = await zip.generateAsync({ type: "blob" });
		//saveAs(content, "files.zip");
		console.log(serverData.material.publication.comments);
	}
</script>

<Meta title={serverData.material.publication.title} description="CAIT" type="site" />

<div class="col-span-full flex flex-col items-start mt-20">
	<h2 class="text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold">{serverData.material.publication.title}</h2>
	<p>{serverData.material.publication.publisher.firstName}</p>
	<div class="flex gap-2">
		<p class="text-sm text-surface-500">{created}</p>
		<Icon icon="mdi:presentation" class="text-xl text-surface-500" />
		<DiffBar diff="easy" className="w-4 h-4" />
	</div>
	<div class="flex flex-wrap gap-2 my-2">
		{#each tags as tag}
			<Tag tagText={tag} removable={false} />
		{/each}
	</div>
	<p class="text-surface-700 dark:text-surface-400">{serverData.material.publication.description}</p>

	<div class="flex items-center text-3xl rounded-lg border mt-4">
		<button type="button"
				class="text-xs flex gap-x-1 items-center px-2 btn rounded-l-lg"
				on:click={() => toggleLike()}>
			<Icon class="text-2xl {likedColor}" icon="material-symbols:star" />
			<span>{serverData.material.publication.likes}</span>
		</button>
		<button type="button" class="flex items-center text-xl btn text-surface-500 px-2 rounded-r-lg"
				on:click={downloadFiles}>
			<Icon class="xl:text-2xl" icon="material-symbols:download" />
		</button>
		<button type="button"
				class="flex items-center text-xl btn text-surface-500 px-2 rounded-r-lg"
				on:click={() => toggleSave()}>
			<Icon class="xl:text-2xl {savedColor}" icon="ic:baseline-bookmark" />
		</button>
	</div>
	<div class="min-h-96 w-full">
		<FileTable operation="download" {files} />
	</div>
	{#if serverData.material.publication.publisherId === $authStore.user?.id}
		<div class="flex gap-2 mt-4">
			<button
				on:click={() => goto(`/${serverData.material.publication.publisherId}/${serverData.material.publicationId}/edit`)}
				type="button" class="btn rounded-lg variant-filled-primary">Edit
			</button>
			<button on:click={promptForDeletion} type="button" class="btn rounded-lg variant-filled-error">Delete
			</button>
		</div>
	{/if}
</div>

<div class="col-span-full flex flex-col mb-1 gap-1">
	<h2 class="text-2xl">Discussion Forum</h2>
	<hr>
</div>

<AddInteractionForm addComment='{true}' commentId="{1}"/>

{#each serverData.material.publication.comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as comment (comment.id)}
	<Comment interaction={comment}
			 popupName="comment + {comment.id} + {new Date(comment.createdAt).toDateString()}" isReply={false} userName="{comment.user.firstName} + {comment.user.lastName}" />
	{#each comment.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) as reply (reply.id)}
		<Comment interaction={reply} popupName="reply + {reply.id} + {new Date(reply.createdAt).toDateString()}" isReply={true} userName="{reply.user.firstName} + {reply.user.lastName}"/>
	{/each}
{/each}
