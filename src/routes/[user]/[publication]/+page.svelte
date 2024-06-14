<script lang="ts">
	import type { LayoutServerData, PageServerData } from './$types';
	import {
		AddInteractionForm,
		Circuit,
		Comment,
		DiffBar,
		FileTable,
		getDateDifference, HorizontalScroll,
		Meta,
		Tag, TheoryAppBar,
		UserProp
	} from '$lib';
	import { fly } from 'svelte/transition';

	import { onMount } from 'svelte';
	import JSZip from 'jszip';
	import Icon from '@iconify/svelte';
	import type { PublicationView } from './+layout.server';
	import { Accordion, AccordionItem, getModalStore, getToastStore } from '@skeletonlabs/skeleton';
	import { goto } from '$app/navigation';
	import { createFileList, IconMapExtension, saveFile } from '$lib/util/file';
	import type { Reply, User } from '@prisma/client';
	import { page } from '$app/stores';

	const toastStore = getToastStore();
	const modalStore = getModalStore();
	export let data: LayoutServerData & PageServerData;
	const userId = $page.data.session?.user.id;

	const pubView: PublicationView = data.pubView;
	const isMaterial: boolean = pubView.isMaterial;

	let likedComments = data.likedComments as number[];
	let likedReplies = data.likedReplies as number[];

	let files: FileList;
	if (isMaterial) {
		files = createFileList(pubView.fileData, pubView.publication.materials.files);
	}

	let liked: boolean = data.userSpecificInfo.liked;
	let likes = pubView.publication.likes;
	let circuitsPubAppearIn = data.circuitsPubAppearIn;
	let likedPublications = data.liked as number[];
	let savedPublications = data.saved.saved as number[];
	let reported = data.reported;



	let saved: boolean = data.userSpecificInfo.saved;
	$:likedColor = liked ? 'text-secondary-500' : 'text-surface-500';
	$:savedColor = saved ? 'text-secondary-500' : 'text-surface-500';

	const toggleReport = async () => {
		await fetch(`/api/user/${userId}/report/${pubView.publication.id}`, {
			method: 'POST'
		}).then(() => reported = !reported);
	};
	const toggleLike = async () => {
		likes = liked ? likes - 1 : likes + 1;
		await fetch(`/api/user/${userId}/liked/${pubView.publication.id}`, {
			method: 'POST'
		}).then(() => liked = !liked);
	};
	const toggleSave = async () => {
		await fetch(`/api/user/${userId}/saved/${pubView.publication.id}`, {
			method: 'POST'
		}).then(() => saved = !saved);
	};

	let tags: string[] = pubView.publication.tags.map(tag => tag.content);

	let created: string;
	$:created = getDateDifference(pubView.publication.createdAt, new Date());

	onMount(() => {
		created = getDateDifference(pubView.publication.createdAt, new Date());
	});

	async function deletePublication() {
		let url: string;
		if (isMaterial) {
			url = '/api/material/' + pubView.publication.id;
		} else {
			url = '/api/circuit/' + pubView.publication.id;
		}
		try {
			await fetch(url, {
				method: 'DELETE'
			}).then(() => {
				toastStore.trigger({
					message: 'Publication deleted successfully',
					background: 'bg-success-200'
				});
				if (isMaterial) {
					goto('/browse');
				} else {
					goto('/browse?type=circuits');
				}
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

		const zipBlob = await zip.generateAsync({ type: 'blob' });
		saveFile(zipBlob, pubView.publication.title + '.zip');
	}


	let comments = pubView.publication.comments;

	/**
	 * add placeholder comment to make it smoother
	 */
	const addComment = async (event: CustomEvent) => {
		const content = event.detail.content;
		const comment = {
			id: content.id,
			userId: content.userId,
			publicationId: content.publicationId,
			likes: 0,
			content: content.content,
			createdAt: content.createdAt,
			updatedAt: content.updatedAt,
			replies: content.replies,
			user: {
				...$page.data.session!.user,
				profilePicData: $page.data.session!.userPfp.data
			}
		};
		comments = [...comments, comment];
	};

	/*
	add placeholder reply
	 */
	const addReply = (event: CustomEvent) => {
		// comment = await (await fetch(`/api/comment/pubView/${pubView.material.publicationId}`)).json()

		let replies = getReplies(event.detail.content.commentId);
		replies.push({
			id: event.detail.content.id,
			userId: event.detail.content.userId,
			commentId: event.detail.content.commentId,
			likes: 0,
			content: event.detail.content.content,
			createdAt: event.detail.content.createdAt,
			updatedAt: event.detail.content.updatedAt,
			user: {
				...$page.data.session!.user,
				profilePicData: $page.data.session!.userPfp.data
			}
		});
		comments = comments;
		// commentMap.set(event.detail.content.commentId, replies);
	};

	const getReplies = (commentId: number): (Reply & { user: User & {profilePicData:string} })[] => {
		return comments.filter(x => x.id == commentId).map(x => x.replies)[0];
	};

	/*
	method to update likes and dislikes prior to reloading the page to deal with updating issues from the backend
	 */
	const updateLikes = (event: CustomEvent) => {
		const liked = event.detail.like;
		const reply = event.detail.reply;
		const id = event.detail.id;

		if (reply) {
			if (liked) {
				likedReplies.push(id);
			} else {
				likedReplies = likedReplies.filter(x => x !== id);
			}
		} else {
			if (liked) {
				likedComments.push(id);
			} else {
				likedComments = likedComments.filter(x => x !== id);
			}
		}
	};

	const getFileExtension = (filePath: string): string => {
		const index = filePath.lastIndexOf('.');
		return index !== -1 ? filePath.substring(index + 1) : '';
	};

	let hoverDivReport: HTMLDivElement;
	let isHoveredReport = false;
	let hoverDiv: HTMLDivElement;
	let isHovered = false;
	const handleHoverReport = () => isHoveredReport = !isHoveredReport;
	const handleHover = () => isHovered = !isHovered;
	onMount(() => {
		if (hoverDivReport && hoverDiv) {
			hoverDivReport.addEventListener('mouseenter', handleHoverReport);
			hoverDivReport.addEventListener('mouseleave', handleHoverReport);
			hoverDiv.addEventListener('mouseenter', handleHover);
			hoverDiv.addEventListener('mouseleave', handleHover);

			return () => {
				hoverDivReport.removeEventListener('mouseenter', handleHoverReport);
				hoverDivReport.removeEventListener('mouseleave', handleHoverReport);
				hoverDiv.removeEventListener('mouseenter', handleHover);
				hoverDiv.removeEventListener('mouseleave', handleHover);
			};
		}
	});
</script>

<Meta title={pubView.publication.title} description="CAIT" type="site" />

<div class="col-span-full flex flex-col items-start mt-20">
	<div class="flex flex-row items-top justify-between w-full">
		<div class="flex flex-col gap-2 w-1/2">
			<h2 class="text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold break-words w-full max-w-full">{pubView.publication.title}</h2>

			<div class="grid grid-cols-6">
				<div bind:this={hoverDiv} class="col-span-2">
					{#if pubView.publication.usedInCourse.length === 1}
						<p class="text-sm opacity-85 break-words max-w-full hover:font-bold underline" >Material is used in {pubView.publication.usedInCourse.length} course</p>
					{:else if pubView.publication.usedInCourse.length > 1}
						<p class="text-sm opacity-85 break-words max-w-full hover:font-bold underline" >Material is used in {pubView.publication.usedInCourse.length} courses</p>
					{/if}

					{#if isHovered}
						<div
								class="absolute mt-2 bg-surface-50 bg-opacity-100 shadow-md p-2 rounded-lg flex gap-2 items-center transition-all duration-300 flex-col"
								style="z-index: 9999;" transition:fly={{ y: -8, duration: 400 }}>
							{#each pubView.publication.usedInCourse.map(x => x.course) as course}
								<p class="text-sm opacity-85 break-words max-w-full">{course}</p>
							{/each}
						</div>
					{/if}
				</div>
			</div>


			{#if pubView.publication.publisherId === $page.data.session?.user.id
			|| pubView.publication.maintainers.map(x => x.id).includes($page.data.session?.user.id || "-1")
			|| $page.data.session?.user.isAdmin}
				<div class="flex gap-2 mt-4">
					{#if pubView.publication.publisherId === $page.data.session?.user.id
					|| pubView.publication.maintainers.map(x => x.id).includes($page.data.session?.user.id || "-1")}
						<button
							on:click={() => goto(`/${pubView.publication.publisherId}/${pubView.publication.id}/edit`)}
							type="button" class="btn rounded-lg variant-filled-primary">Edit
						</button>
					{/if}
					<button on:click={promptForDeletion} type="button" class="btn rounded-lg variant-filled-error">
						Delete
					</button>
				</div>
			{/if}
			<div class="flex gap-2">
				<p class="text-sm text-surface-500">{created}</p>

				{#if isMaterial}
					{#if pubView.publication.materials.files.length === 1}
						<Icon
							icon={IconMapExtension.get(pubView.publication.materials.files.map((f => getFileExtension(f.title)))[0]) || 'vscode-icons:file-type-text'}
							class="text-xl text-surface-500" />
					{:else}
						<Icon icon="clarity:file-group-solid" class="text-xl text-primary-500" />
					{/if}
					<div class="self-center">
						<DiffBar diff="{pubView.publication.difficulty}" className="w-4 h-4" />
					</div>
				{:else }
					<Icon icon="mdi:graph" class="text-xl text-primary-500" />
				{/if}

			</div>

			<div class="flex flex-wrap gap-2 my-2">
				{#each tags as tag}
					<Tag tagText={tag} removable={false} />
				{/each}
			</div>
			<div class="w-full">
				<p class="text-surface-700 dark:text-surface-400 w-full max-w-full break-words">{pubView.publication.description}</p>
				{#if isMaterial}
					{#if pubView.publication.materials.timeEstimate}
						<p class="text-surface-400 text-sm mt-4"> Time
							Estimate: {pubView.publication.materials.timeEstimate} </p>
					{/if}
					<p class="text-surface-400 text-sm">Copyright: {pubView.publication.materials.copyright}</p>
				{/if}
			</div>
		</div>


		<div class="flex flex-col gap-2">
			{#if isMaterial && pubView.publication.materials.theoryPractice}
				<TheoryAppBar value="{pubView.publication.materials.theoryPractice}" editable="{false}" />
			{/if}
			<div class="flex gap-2">
				<UserProp role="Publisher" userPhotoUrl={'data:image;base64,' + pubView.publication.publisher.profilePicData} view="material"
						  user={pubView.publication.publisher} />
				{#each pubView.publication.maintainers as maintainer}
					<UserProp role="Maintainer" userPhotoUrl={'data:image;base64,' + maintainer.profilePicData} view="material" user={maintainer} />
				{/each}
			</div>
		</div>
	</div>
</div>


<div class="col-span-full flex flex-col items-start mt-2">

</div>

<div class="col-span-full flex flex-col items-start mt-2">

	<div class="flex ">
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

			<div bind:this={hoverDivReport}>
				<button on:click={toggleReport} class="pl-2 pr-1">
					{#if reported}
						<Icon icon="material-symbols:flag" class="self-center size-6 text-surface-600" />
					{:else}
						<Icon icon="material-symbols:flag-outline" class="self-center size-6 text-surface-600" />
					{/if}
				</button>
				{#if isHoveredReport}
					<div
							class="absolute mt-2 bg-surface-50 bg-opacity-100 shadow-md p-2 rounded-lg flex gap-2 items-center transition-all duration-300"
							style="z-index: 9999;" transition:fly={{ y: -8, duration: 400 }}>
						<p class="text-xs">Report publication</p>
					</div>
				{/if}
			</div>

		</div>


	</div>

	{#if isMaterial}
		<div class="flex justify-between w-full gap-4">
			<div class="w-full">
				<FileTable operation="download" {files} />
			</div>
			<Accordion class="mt-7 " regionPanel="space-y-8" padding="p-3">
				<AccordionItem class="variant-soft-primary rounded-lg">
					<svelte:fragment slot="summary">Learning Objectives</svelte:fragment>
					<svelte:fragment slot="content">
						{#if pubView.publication.learningObjectives.length === 0}
							<span>No learning objectives have been indicated</span>
						{:else}
							{#each pubView.publication.learningObjectives as LO}
								<p class="w-full text-surface-800 dark:text-surface-100 my-1">{LO}</p>
							{/each}
						{/if  }
					</svelte:fragment>
				</AccordionItem>
				<AccordionItem class="variant-soft-primary rounded-lg">
					<svelte:fragment slot="summary">Prior Knowledge</svelte:fragment>
					<svelte:fragment slot="content">
						{#if pubView.publication.prerequisites.length === 0}
							<span>No prior knowledge has been indicated</span>
						{:else}
							{#each pubView.publication.prerequisites as PK}
								<p class="w-full text-surface-800 dark:text-surface-100 my-1">{PK}</p>
							{/each}
						{/if}

					</svelte:fragment>
				</AccordionItem>
			</Accordion>
		</div>

	{:else}
		<div class="w-full">
			<Accordion class="mt-7 " regionPanel="space-y-8" padding="p-3">
				<AccordionItem class="variant-soft-primary rounded-lg">
					<svelte:fragment slot="summary">Learning Objectives</svelte:fragment>
					<svelte:fragment slot="content">
						{#if pubView.publication.learningObjectives.length === 0}
							<span>No learning objectives have been indicated</span>
						{:else}
							{#each pubView.publication.learningObjectives as LO}
								<p class="w-full text-surface-800 dark:text-surface-100 my-1">{LO}</p>
							{/each}
						{/if  }
					</svelte:fragment>
				</AccordionItem>
				<AccordionItem class="variant-soft-primary rounded-lg">
					<svelte:fragment slot="summary">Prior Knowledge</svelte:fragment>
					<svelte:fragment slot="content">
						{#if pubView.publication.prerequisites.length === 0}
							<span>No prior knowledge has been indicated</span>
						{:else}
							{#each pubView.publication.prerequisites as PK}
								<p class="w-full text-surface-800 dark:text-surface-100 my-1">{PK}</p>
							{/each}
						{/if}

					</svelte:fragment>
				</AccordionItem>
			</Accordion>
			<Circuit publishing="{false}" nodes="{pubView.publication.circuit.nodes}" />
		</div>
	{/if}

</div>

{#if circuitsPubAppearIn.length > 0}
	<div class="col-span-full flex flex-col mb-1 gap-1 mt-10">
		<h2 class="text-2xl">This publication appears in:</h2>
		<hr>
	</div>
	<div class="col-span-full">
		<HorizontalScroll publications="{circuitsPubAppearIn}" bind:liked="{likedPublications}" bind:saved="{savedPublications}"/>
	</div>
{/if}


<div class="col-span-full flex flex-col mb-1 gap-1 mt-10">
	<h2 class="text-2xl">Discussion Forum</h2>
	<hr>
</div>

{#if $page.data.session?.user}
	<AddInteractionForm on:addedReply={addComment} addComment='{true}' commentId="{1}"
						publicationId="{pubView.publication.id}" />
{/if}

{#each comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as comment (comment.id)}
	<Comment on:likeUpdate={updateLikes} on:ReplyAction={addReply} interaction={comment}
			 photoUrl={comment.user.profilePicData}
			 isReply={false} userName="{comment.user.firstName} {comment.user.lastName}"
			 liked='{likedComments.includes(comment.id)}'
	/>
	{#each comment.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) as reply (reply.id)}
		<Comment on:likeUpdate={updateLikes} interaction={reply} isReply={true} photoUrl={reply.user.profilePicData}
				 userName="{reply.user.firstName} {reply.user.lastName}" liked='{likedReplies.includes(reply.id)}' />
	{/each}

{/each}
