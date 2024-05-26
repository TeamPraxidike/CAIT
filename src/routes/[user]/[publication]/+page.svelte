<script lang="ts">
	import type { LayoutServerData, PageServerData } from './$types';
	import { DiffBar, getDateDifference, Meta, Tag, FileTable, Comment, authStore, AddInteractionForm, UserProp } from '$lib';
	import { onMount } from 'svelte';
	import JSZip from 'jszip';
	import Icon from '@iconify/svelte';
	import type { PublicationViewLoad } from './+layout.server';
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { createFileList } from '$lib/util/file';
	import type { Reply, User } from '@prisma/client';

	const toastStore = getToastStore();
	const modalStore = getModalStore();
	export let data: LayoutServerData;
	let serverData: PublicationViewLoad = data.loadedPublication;

	let likedComments = data.likedComments;
	let likedReplies = data.likedReplies;

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
	}


	let comments = serverData.material.publication.comments
	let commentMap: Map<number, (Reply & {user: User})[]> = new Map<number,  (Reply & {user: User})[]>();
	for (const comment of comments) {
		commentMap.set(comment.id, comment.replies);
	}
	const emptyListReplies: (Reply & {user: User})[] = []

	/*
	add placeholder comment to make it smoother
	 */
	const addComment = async (event: CustomEvent) => {
		//comment = await (await fetch(`/api/comment/publication/${serverData.material.publicationId}`)).json()

		const maxId = (comments.length > 0 ? Math.max(...comments.map(a => a.id)) : 0) + 1;
		const comment = {
			id: maxId,
			userId: $authStore.user?.id || 0,
			publicationId: serverData.material.publicationId,
			likes: 0,
			content: event.detail.text,
			createdAt: new Date(),
			updatedAt: new Date(),
			replies: emptyListReplies,
			user: $authStore.user ? $authStore.user : {
				id: 0,
				firstName: "John",
				lastName: "Doe",
				username: "johndoe",
				email: "johndoe@example.com",
				profilePic: "johnDoe",
				reputation: 0,
				isAdmin: false,
			},
		}
		comments = [...comments, comment];
		commentMap.set(maxId, emptyListReplies);
	}

	/*
	add placeholder reply
	 */
	const addReply = (event: CustomEvent) => {
		// comment = await (await fetch(`/api/comment/publication/${serverData.material.publicationId}`)).json()

		let replies = getReplies(event.detail.comment)
		replies.push({
			id: (replies.length>0 ? Math.max(...replies.map(a => a.id)): 0) + 1,
			userId: $authStore.user?.id || 0,
			commentId: event.detail.comment,
			likes: 0,
			content: event.detail.text,
			createdAt: new Date(),
			updatedAt:new Date(),
			user: $authStore.user ? $authStore.user :{
				id: 0,
				firstName: "John",
				lastName: "Doe",
				username: "johndoe",
				email: "johndoe@example.com",
				profilePic: "johnDoe",
				reputation: 0,
				isAdmin: false,
			} ,
		});
		comments = comments;
		commentMap.set(event.detail.comment, replies);
	}

	const getReplies = (commentId: number): (Reply & {user: User})[] => {
		return commentMap.has(commentId) ? commentMap.get(commentId)||[] : []
	}



</script>

<Meta title={serverData.material.publication.title} description="CAIT" type="site" />

<div class="col-span-full flex flex-col items-start mt-20">
	<div class="flex justify-between w-full">
		<div>
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
		</div>
		<div class="flex gap-2">
			<UserProp role="Publisher" userPhotoUrl="/fdr.jpg" view="material" user={serverData.material.publication.publisher} />
			{#each serverData.material.publication.maintainers as maintainer}
				<UserProp role="Maintainer" userPhotoUrl="/fdr.jpg" view="material" user={maintainer} />
			{/each}
		</div>
	</div>

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

{#if $authStore.user}
	<AddInteractionForm on:addedReply={addComment} addComment='{true}' commentId="{1}" publicationId="{serverData.material.publicationId}"/>
{/if}

{#each comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as comment (comment.id)}
	<Comment on:ReplyAction={addReply} interaction={comment}
			  isReply={false} userName="{comment.user.firstName} {comment.user.lastName}" liked='{likedComments.includes(comment.id)}'
	/>
		{#each getReplies(comment.id).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())  as reply (reply.id)}
			<Comment interaction={reply} isReply={true} userName="{reply.user.firstName} {reply.user.lastName}" liked='{likedReplies.includes(reply.id)}'/>
		{/each}

{/each}
