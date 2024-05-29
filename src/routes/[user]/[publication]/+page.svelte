<script lang="ts">
	import type { LayoutServerData } from './$types';
	import {
		DiffBar,
		getDateDifference,
		Meta,
		Tag,
		FileTable,
		Comment,
		authStore,
		AddInteractionForm,
		UserProp, Circuit
	} from '$lib';
	import { onMount } from 'svelte';
	import JSZip from 'jszip';
	import Icon from '@iconify/svelte';
	import type { PublicationView } from './+layout.server';
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { createFileList } from '$lib/util/file';
	import type { Reply, User } from '@prisma/client';

	const toastStore = getToastStore();
	const modalStore = getModalStore();
	export let data: LayoutServerData;
	const userId = $authStore.user?.id;

	let serverData: PublicationView = data.loadedPublication.loadedPublication;
	const isMaterial : boolean = serverData.isMaterial

	// console.log(isMaterial)
	 	console.log("Yep")
	 console.log(serverData)

	let likedComments = data.likedComments as number[];
	let likedReplies = data.likedReplies as number[];

	let files: FileList;

		if (isMaterial)
		{
			files = createFileList(serverData.fileData, serverData.publication.materials.files)
		}

	let liked: boolean = data.loadedPublication.userSpecificInfo.liked;
	let likes = serverData.publication.likes;

	let saved: boolean = data.loadedPublication.userSpecificInfo.saved;
	$:likedColor = liked ? 'text-secondary-500' : 'text-surface-500';
	$:savedColor = saved ? 'text-secondary-500' : 'text-surface-500';
	const toggleLike = async () => {
		likes = liked ? likes - 1 : likes + 1;
		await fetch(`/api/user/${userId}/liked/${serverData.publication.id}`, {
			method: 'POST',
		}).then(() => liked = !liked);
	}
	const toggleSave = async () => {
		await fetch(`/api/user/${userId}/saved/${serverData.publication.id}`, {
			method: 'POST',
		}).then(() => saved = !saved);
	}

	let tags: string[] = serverData.publication.tags.map(tag => tag.content);

	let created: string;
	$:created = getDateDifference(serverData.publication.createdAt, new Date());

	onMount(() => {
		created = getDateDifference(serverData.publication.createdAt, new Date());
	});

	async function deletePublication() {
		const url = '/api/material/' + serverData.publication.id;
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
	}


	let comments = serverData.publication.comments

	/*
	add placeholder comment to make it smoother
	 */
	const addComment = async (event: CustomEvent) => {
		//comment = await (await fetch(`/api/comment/publication/${serverData.material.publicationId}`)).json()
		//console.log(event.detail.content)
		// const maxId = (comments.length > 0 ? Math.max(...comments.map(a => a.id)) : 0) + 1;
		const content = event.detail.content
		const comment = {
			id: content.id,
			userId: content.userId,
			publicationId: content.publicationId,
			likes: 0,
			content: content.content,
			createdAt: content.createdAt,
			updatedAt: content.updatedAt,
			replies: content.replies,
			user: content.user,
		}
		comments = [...comments, comment];
	}

	/*
	add placeholder reply
	 */
	const addReply = (event: CustomEvent) => {
		// comment = await (await fetch(`/api/comment/publication/${serverData.material.publicationId}`)).json()

		let replies = getReplies(event.detail.content.commentId)
		replies.push({
			id: event.detail.content.id,
			userId: event.detail.content.userId,
			commentId: event.detail.content.commentId,
			likes: 0,
			content: event.detail.content.content,
			createdAt: event.detail.content.createdAt,
			updatedAt: event.detail.content.updatedAt,
			user: event.detail.content.user,
		});
		comments = comments;
		// commentMap.set(event.detail.content.commentId, replies);
	}

	const getReplies = (commentId: number): (Reply & {user: User})[] => {
		return comments.filter(x=> x.id == commentId).map(x=>x.replies)[0];
	}

	/*
	method to update likes and dislikes prior to reloading the page to deal with updating issues from the backend
	 */
	const updateLikes = (event: CustomEvent) =>{
		const liked = event.detail.like;
		const reply = event.detail.reply;
		const id = event.detail.id;

		if(reply){
			if(liked){
				likedReplies.push(id);
			}else{
				likedReplies = likedReplies.filter(x=>x!==id)
			}
		}else{
			if(liked){
				likedComments.push(id);
			}else{
				likedComments = likedComments.filter(x=>x!==id)
			}
		}
	}

</script>

<Meta title={serverData.publication.title} description="CAIT" type="site" />

<div class="col-span-full flex flex-col items-start mt-20">
	<div class="flex justify-between w-full">
		<div>
			<h2 class="text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold">{serverData.publication.title}</h2>
			<p>By {serverData.publication.publisher.firstName}</p>
			<div class="flex gap-2">
				<p class="text-sm text-surface-500">{created}</p>
				{#if isMaterial}
					<Icon icon="mdi:presentation" class="text-xl text-surface-500" />
					<DiffBar diff="easy" className="w-4 h-4" />
				{:else}
					<Icon icon="mdi:graph" class="text-xl text-surface-500" />
				{/if}

			</div>
			<div class="flex flex-wrap gap-2 my-2">
				{#each tags as tag}
					<Tag tagText={tag} removable={false} />
				{/each}
			</div>
			<p class="text-surface-700 dark:text-surface-400">{serverData.publication.description}</p>
		</div>
		<div class="flex gap-2">
			<UserProp role="Publisher" userPhotoUrl="/fdr.jpg" view="material" user={serverData.publication.publisher} />
			{#each serverData.publication.maintainers as maintainer}
				<UserProp role="Maintainer" userPhotoUrl="/fdr.jpg" view="material" user={maintainer} />
			{/each}
		</div>
	</div>

	<div class="flex items-center text-3xl rounded-lg border mt-4">
		<button type="button"
				class="text-xs flex gap-x-1 items-center px-2 btn rounded-l-lg"
				on:click={() => toggleLike()}>
			<Icon class="text-2xl {likedColor}" icon="material-symbols:star" />
			<span>{likes}</span>
		</button>
		{#if isMaterial}
			<button type="button" class="flex items-center text-xl btn text-surface-500 px-2 rounded-r-lg"
							on:click={downloadFiles}>
				<Icon class="xl:text-2xl" icon="material-symbols:download" />
			</button>
		{/if}
		<button type="button"
				class="flex items-center text-xl btn text-surface-500 px-2 rounded-r-lg"
				on:click={() => toggleSave()}>
			<Icon class="xl:text-2xl {savedColor}" icon="ic:baseline-bookmark" />
		</button>
	</div>

	{#if isMaterial}
		<div class="min-h-96 w-full">
			<FileTable operation="download" {files} />
		</div>
	{:else}
		<div class="min-h-96 w-full">
			<Circuit publishing="{false}" nodes="{serverData.publication.circuit.nodes}"/>
		</div>
	{/if}
	{#if serverData.publication.publisherId === $authStore.user?.id}
		<div class="flex gap-2 mt-4">
			<button
				on:click={() => goto(`/${serverData.publication.publisherId}/${serverData.publication.id}/edit`)}
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

{#if $authStore.user}
	<AddInteractionForm on:addedReply={addComment} addComment='{true}' commentId="{1}" publicationId="{serverData.publication.id}"/>
{/if}

{#each comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as comment (comment.id)}
	<Comment on:likeUpdate={updateLikes} on:ReplyAction={addReply} interaction={comment}
			  isReply={false} userName="{comment.user.firstName} {comment.user.lastName}" liked='{likedComments.includes(comment.id)}'
	/>
		{#each comment.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())  as reply (reply.id)}
			<Comment on:likeUpdate={updateLikes} interaction={reply} isReply={true} userName="{reply.user.firstName} {reply.user.lastName}" liked='{likedReplies.includes(reply.id)}'/>
		{/each}

{/each}
