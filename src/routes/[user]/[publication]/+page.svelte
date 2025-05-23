<script lang="ts">
    import type {LayoutServerData, PageServerData} from './$types';
    import {
        AddInteractionForm,
        CircuitComponent,
        Comment,
        DiffBar,
        FileTable,
        getDateDifference, HorizontalScroll,
        Meta,
        Tag, TheoryAppBar,
        UserProp
    } from '$lib';
    import {fly} from 'svelte/transition';
    import {TabGroup, Tab} from '@skeletonlabs/skeleton';

    import {onMount} from 'svelte';
    import JSZip from 'jszip';
    import Icon from '@iconify/svelte';
    import type {PublicationView} from './+layout.server';
    import {
        Accordion,
        AccordionItem,
        getModalStore,
        getToastStore,
        type ModalSettings,
        type ToastSettings
    } from '@skeletonlabs/skeleton';
    import {goto} from '$app/navigation';
    import {createFileList, IconMapExtension, saveFile} from '$lib/util/file';
    import {
        type Comment as PrismaComment,
        type Difficulty, MaterialType,
        PublicationType,
        type Reply,
        type User
    } from '@prisma/client';
    import {page} from '$app/stores';
    import { SvelteFlowProvider } from '@xyflow/svelte';
    import type { NodeInfo } from '$lib/components/circuits/methods/CircuitTypes';

	const toastStore = getToastStore();
	const modalStore = getModalStore();

	export let data: LayoutServerData & PageServerData;
	//$: ({ loggedUser } = data);
	let loggedUser = $page.data.loggedUser;
	const userId = $page.data.session?.user.id;

	let tabSet: number = 0;
	let pubView: PublicationView;
	let isMaterial: boolean;
	let likedComments: number[] = [];
	let likedReplies: number[] = [];
	let files: FileList | [];
	let liked: boolean = false;
	let likes: number;
	let circuitsPubAppearIn: any[] = [];
	let similarPublications: any[] = [];
	let likedPublications: number[] = [];
	let savedPublications: number[] = [];
	let reported: boolean = false;
	let saved: boolean = false;
	let tags: string[] = [];
	let created: string;
	let comments: (PrismaComment & {
		replies: (Reply & { user: User & { profilePicData: string } })[];
		user: User & { profilePicData: string }
	})[] = [];
	let userSpecificInfo: { liked: boolean; saved: boolean };
	let diff: Difficulty = data.pubView.publication.difficulty;

    pubView = data.pubView as PublicationView;
    isMaterial = pubView.isMaterial;
    const nodes : NodeInfo[] = isMaterial ? [] : pubView.publication.circuit.nodes.map(node => ({
        id: node.publication.id,
        title: node.publication.title,
        isMaterial: node.publication.type === PublicationType.Material,
        next: node.next,
        posX: node.posX,
        posY: node.posY,
        extensions: node.extensions,
        publisherId: node.publication.publisherId
    }))
    userSpecificInfo = data.userSpecificInfo as { liked: boolean; saved: boolean }
    likedComments = data.likedComments as number[];
    likedReplies = data.likedReplies as number[];

	//files = isMaterial ? createFileList(pubView.fileData, pubView.publication.materials.files) : [];

	// let loading: boolean = false;
	// let error: string | null = null;

	// // Function to fetch files
	// async function fetchFiles() {
	// 	if (!isMaterial) {
	// 		files = [];
	// 		return;
	// 	}
	//
	// 	loading = true;
	// 	error = null;
	//
	// 	try {
	// 		const res = await fetch(`/api/material/${pubView.publication.id}/files`);
	// 		if (!res.ok) {
	// 			throw new Error(`Failed to load files: ${res.statusText}`);
	// 		}
	// 		const fileData = await res.json();
	//
	// 		files = await createFileList(fileData, pubView.publication.materials.files);
	// 	} catch (err) {
	// 		console.error('Error creating file list:', err);
	// 		error = 'Failed to load files.';
	// 	} finally {
	// 		loading = false;
	// 	}
	// }
	//
	// // Fetch files when the component mounts or when dependencies change
	// onMount(() => {
	// 	fetchFiles();
	// });

	liked = userSpecificInfo.liked;
	likes = pubView.publication.likes;

	// circuitsPubAppearIn = data.circuitsPubAppearIn;
	// similarPublications = data.similarPublications;

	likedPublications = data.liked as number[];
	savedPublications = data.saved.saved as number[];
	reported = data.reported;

	saved = userSpecificInfo.saved;
	$: comments = pubView.publication.comments;
	tags = pubView.publication.tags.map(tag => tag.content) as string[];
	created = getDateDifference(pubView.publication.createdAt, new Date()) as string;
   

	//console.log(pubView.publication.publisher.username)


	$: if (data) {
		pubView = data.pubView as PublicationView;

		userSpecificInfo = data.userSpecificInfo as { liked: boolean; saved: boolean };
		likedComments = data.likedComments as number[];
		likedReplies = data.likedReplies as number[];
		diff = data.pubView.publication.difficulty;

		isMaterial = data.pubView.isMaterial;

		//files = isMaterial ? createFileList(data.pubView.fileData, data.pubView.publication.materials.files) : [];
		//fetchFiles()

		liked = data.userSpecificInfo.liked;
		likes = data.pubView.publication.likes;

		// circuitsPubAppearIn = data.circuitsPubAppearIn;
		// similarPublications = data.similarPublications;

		likedPublications = data.liked as number[];
		savedPublications = data.saved.saved as number[];
		reported = data.reported;

		saved = data.userSpecificInfo.saved;
		comments = data.pubView.publication.comments;
		tags = pubView.publication.tags.map(tag => tag.content) as string[];
		created = getDateDifference(data.pubView.publication.updatedAt, new Date()) as string;
	}

	$:likedColor = liked ? 'text-secondary-500' : 'text-surface-500';
	$:savedColor = saved ? 'text-secondary-500' : 'text-surface-500';

	const successfulReport: ToastSettings = {
		message: 'Publication successfully reported',
		background: 'variant-filled-success'
	};
	const successfulUnreport: ToastSettings = {
		message: 'Publication successfully unreported',
		background: 'variant-filled-success'
	};


	const sendReportRequest = async () => {
		await fetch(`/api/user/${userId}/report/${pubView.publication.id}`, {
			method: 'POST'
		}).then(() => reported = !reported);
		if (reported) {
			toastStore.trigger(successfulReport);
		} else {
			toastStore.trigger(successfulUnreport);
		}
	};
	const toggleReport = async () => {
		if (!reported)
			modalStore.trigger(modal);
		else
			await sendReportRequest();
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
					background: 'bg-success-200',
					classes: 'text-surface-900'
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

	const extractNodesFromPubView  = () : NodeInfo[] => {
		return pubView.publication.circuit.nodes.map(x => ({
			id: x.publicationId,
			title: x.publication.title,
			isMaterial: x.publication.type === PublicationType.Material,
			extensions: x.extensions,
			username: x.publication.publisher.username,
			posX:x.posX,
			posY:x.posY,
			next:x.next
		}))
	}

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
			user: loggedUser
		};
		comments = [...comments, comment];
	};


	const addReply = (event: CustomEvent) => {
		let commentIndex = comments.findIndex(c => c.id === event.detail.content.commentId);
		const replies = [
			...comments[commentIndex].replies,
			{
				id: event.detail.content.id,
				userId: event.detail.content.userId,
				commentId: event.detail.content.commentId,
				likes: 0,
				content: event.detail.content.content,
				createdAt: event.detail.content.createdAt,
				updatedAt: event.detail.content.updatedAt,
				user: loggedUser
			}
		]
		if (commentIndex !== -1) {
			comments[commentIndex] = {
				...comments[commentIndex],
				replies: replies
			};
			comments = [...comments];
		}
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
	const tagFilter = (event: CustomEvent) => {
		const tagContent = event.detail.text;
		if (isMaterial) {
			goto(`/browse?type=materials&tags=${tagContent}`);
		} else {
			goto(`/browse?type=circuits&tags=${tagContent}`);

		}
	};
	const modal: ModalSettings = {
		type: 'confirm',
		title: 'Are you sure you want to report this publication?',
		body: 'You can unreport it later if you decide to.',
		response: async (r: boolean) => {
			if (r) {
				await sendReportRequest();
			}
		}
	};

	// Assures currently displayed tab is 0 (materials/circuit)
	function handleTabEvent(event: any) {
		const { tabValue } = event.detail;
		//console.log(tabValue);
		tabSet = tabValue;
	}

	let hoverDivReport: HTMLDivElement;
	let isHoveredReport = false;
	let hoverDiv: HTMLDivElement;
	let isHovered = false;
	let hoverEdit: HTMLButtonElement;
	let isHoveredEdit = false;
	let hoverDelete: HTMLButtonElement;
	let isHoveredDelete = false;
	const handleHoverReport = () => isHoveredReport = !isHoveredReport;
	const handleHover = () => isHovered = !isHovered;
	const handleHoverDelete = () => isHoveredDelete = !isHoveredDelete;
	const handleHoverEdit = () => isHoveredEdit = !isHoveredEdit;

	$: deleteIcon = isHoveredDelete ? 'mdi:trash-can' : 'mdi:trash-can-outline';
	$: editIcon = isHoveredEdit ? 'mdi:pencil' : 'mdi:pencil-outline';

	onMount(() => {
		if (hoverDivReport && hoverDiv && hoverEdit && hoverDelete) {
			hoverDivReport.addEventListener('mouseenter', handleHoverReport);
			hoverDivReport.addEventListener('mouseleave', handleHoverReport);
			hoverDiv.addEventListener('mouseenter', handleHover);
			hoverDiv.addEventListener('mouseleave', handleHover);

			hoverEdit.addEventListener('mouseenter', handleHoverEdit);
			hoverEdit.addEventListener('mouseleave', handleHoverEdit);
			hoverDelete.addEventListener('mouseenter', handleHoverDelete);
			hoverDelete.addEventListener('mouseleave', handleHoverDelete);

			return () => {
				hoverDivReport.removeEventListener('mouseenter', handleHoverReport);
				hoverDivReport.removeEventListener('mouseleave', handleHoverReport);
				hoverDiv.removeEventListener('mouseenter', handleHover);
				hoverDiv.removeEventListener('mouseleave', handleHover);

				hoverEdit.removeEventListener('mouseenter', handleHoverEdit);
				hoverDelete.removeEventListener('mouseenter', handleHoverDelete);
				hoverEdit.removeEventListener('mouseleave', handleHoverEdit);
				hoverDelete.removeEventListener('mouseleave', handleHoverDelete);
			};
		}
	});
</script>

<Meta title={pubView.publication.title} description="CAIT" type="site" />

<div class="flex flex-col col-span-full">
	<div class="flex flex-row justify-start items-center mt-20">

		<h2 class="text-lg md:text-xl lg:text-2xl xl:text-4xl font-semibold break-words pr-2 self-center">{pubView.publication.title}</h2>
		{#if data.pubView.publication.isDraft}
			<div class="bg-warning-100 text-warning-700 rounded-full px-3 py-1 inline-block self-center mr-6">
				<p class="text-sm font-semibold">Draft</p>
			</div>
		{/if}

		{#if pubView.publication.publisherId === $page.data.session?.user.id
		|| pubView.publication.maintainers.map(x => x.id).includes($page.data.session?.user.id || "-1")
		|| loggedUser.isAdmin}
			<div class="space-x-1">
				{#if pubView.publication.publisherId === $page.data.session?.user.id
				|| pubView.publication.maintainers.map(x => x.id).includes($page.data.session?.user.id || "-1")}
					<button bind:this={hoverEdit}
							on:click={() => goto(`/${pubView.publication.publisher.username}/${pubView.publication.id}/edit`)}
							type="button" class="btn self-center p-0 m-0">
						<Icon icon={editIcon} width="24" class="text-surface-700" />
					</button>
				{/if}
				<button on:click={promptForDeletion} type="button" class="btn p-0 m-0" bind:this={hoverDelete}>
					<Icon icon={deleteIcon} width="24" class="text-error-400" />
				</button>
			</div>
		{/if}
	</div>
	<div class="flex gap-4 items-center">
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
					<DiffBar bind:diff="{diff}" className="w-4 h-4" />
				</div>
			{:else }
				<Icon icon="mdi:graph" class="text-xl text-primary-500" />
			{/if}
		</div>

		<div class="flex flex-wrap gap-2 my-2">
			{#each tags as tag}
				<Tag tagText={tag} removable={false} onView={true} on:FilterTag={tagFilter} />
			{/each}
		</div>
	</div>
</div>

<div class="col-span-full grid grid-cols-4 gap-24 flex-row items-top justify-between w-full">

	<!--  LEFT BIG COLUMN  -->
	<div class="flex flex-col gap-2 col-span-3">
		<div class="grid grid-cols-6">
			<div bind:this={hoverDiv} class="col-span-2">
				{#if pubView.publication.usedInCourse.length === 1}
					<p class="text-sm opacity-85 break-words max-w-full underline">Material is used
						in {pubView.publication.usedInCourse.length} course</p>
				{:else if pubView.publication.usedInCourse.length > 1}
					<p class="text-sm opacity-85 break-words max-w-full underline">Material is used
						in {pubView.publication.usedInCourse.length} courses</p>
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

		<p class="text-surface-700 dark:text-surface-400 w-full max-w-full break-words">
			{pubView.publication.description}
		</p>

		<div class="w-full flex justify-between">
			<div>
				{#if isMaterial}
					{#if pubView.publication.materials.timeEstimate}
						<p class="text-surface-400 text-sm mt-4"> Time
							Estimate: {pubView.publication.materials.timeEstimate} </p>
					{/if}
					<p class="text-surface-400 text-sm">Copyright: {pubView.publication.materials.copyright}</p>
				{/if}
			</div>
			<div class="col-span-full flex flex-col items-start mt-2">
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
								<Icon icon="material-symbols:flag-outline"
									  class="self-center size-6 text-surface-600" />
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
		</div>
		<TabGroup>
			<Tab bind:group={tabSet} name="Materials" value={0}>
				Materials
			</Tab>
			<Tab bind:group={tabSet} name="Discussion" value={1}>
				Discussion
			</Tab>
			<Tab bind:group={tabSet} name="Related" value={2}>
				Related
			</Tab>

			<svelte:fragment slot="panel">
				{#if tabSet === 0}

					<!--    FILES -->
					<!--Uses the "Streaming" feature in SvelteKit-->
					{#if isMaterial}
						{#await data.fetchedFiles}
							<p>Loading files...</p>
						{:then files}
							{#if files.length === 0}
								<p>This publication has no files</p>
							{:else}
								<div class="w-full">
									<FileTable operation="download" files={createFileList(files, pubView.publication.materials.files)} />
								</div>
							{/if}
						{:catch error}
							<!--TODO: Change color-->
							<p style="color: red">Error while loading files. Reload the page to try again</p>
						{/await}
					{:else}
						<div class="w-full">
							<SvelteFlowProvider>
								<CircuitComponent publishing="{false}" dbNodes="{extractNodesFromPubView()}"/>
							</SvelteFlowProvider>						</div>
					{/if}

				{:else if tabSet === 1}

					<!--    DISCUSSION -->
					{#if $page.data.session?.user}
						<AddInteractionForm publisher={loggedUser} on:addedReply={addComment} addComment='{true}'
											commentId="{1}" publicationId="{pubView.publication.id}" />
					{/if}

					{#each comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as comment (comment.id)}
						<Comment commenter={loggedUser} on:likeUpdate={updateLikes} on:ReplyAction={addReply}
								 interaction={comment}
								 photoUrl={comment.user.profilePicData}
								 isReply={false} userName="{comment.user.firstName} {comment.user.lastName}"
								 liked='{likedComments.includes(comment.id)}'
						/>
						{#each comment.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) as reply (reply.id)}
							<Comment commenter={loggedUser} on:likeUpdate={updateLikes} interaction={reply}
									 isReply={true}
									 photoUrl={reply.user.profilePicData}
									 userName="{reply.user.firstName} {reply.user.lastName}"
									 liked='{likedReplies.includes(reply.id)}' />
						{/each}
					{/each}


				{:else if tabSet === 2}

					<!--SHOW SIMILAR PUBLICATIONS-->
					<!--Uses the "Streaming" feature in SvelteKit-->
					{#await data.similarPublications}
						<p>Loading similar publications...</p>
					{:then similar}
						{#if similar.length > 0}
							<div class="col-span-full flex flex-col mb-1 gap-1 mt-10">
								<h2 class="text-2xl">Other publications similar to this:</h2>
								<hr>
							</div>
							<div class="col-span-full">
								<HorizontalScroll publications="{similar}" bind:liked="{likedPublications}"
												  bind:saved="{savedPublications}"
												  on:resetTab={handleTabEvent} />
							</div>
						{/if}
					{:catch error}
						<!--TODO: Change color-->
						<p style="color: red">Error while loading similar publications. Reload the page to try again</p>
					{/await}

					<!--    CIRCUITS THAT INCLUDE THIS CONTENT -->
					<!--Uses the "Streaming" feature in SvelteKit-->
					{#await data.circuitsPubAppearIn}
						<p>Loading circuits that feature this publication...</p>
					{:then cPAI}
						{#if cPAI.length > 0}
							<div class="col-span-full flex flex-col mb-1 gap-1 mt-10">
								<h2 class="text-2xl">This publication appears in:</h2>
								<hr>
							</div>
							<div class="col-span-full">
								<HorizontalScroll publications="{cPAI}" bind:liked="{likedPublications}"
												  bind:saved="{savedPublications}"
												  on:resetTab={handleTabEvent} />
							</div>
						{/if}
					{:catch error}
						<!--TODO: Change color-->
						<p style="color: red">Error while loading circuits. Reload the page to try again</p>
					{/await}
				{/if}
			</svelte:fragment>
		</TabGroup>
	</div>

	{#key pubView.publication.id}
		<!--   RIGHT SINGLE 1/4 COLUMN   -->
		<div class="flex flex-col gap-4">
			<div class="flex gap-2">
				<UserProp role="Publisher"
						  userPhotoUrl={pubView.publication.publisher.profilePicData}
						  view="material"
						  bind:user={pubView.publication.publisher} />
				{#each pubView.publication.maintainers as maintainer}
					<UserProp role="Maintainer" userPhotoUrl={maintainer.profilePicData}
							  view="material" user={maintainer} />
				{/each}
			</div>
			<div class="flex flex-col">
				<span class="font-bold text-surface-800">Learning Objectives:</span>
				<ul class="list-inside">
					{#if pubView.publication.learningObjectives.length === 0}
						<span>No learning objectives have been indicated</span>
					{:else}
						{#each pubView.publication.learningObjectives as lo}
							<li class="list text-surface-700 text-sm list-disc">{lo}</li>
						{/each}
					{/if}
				</ul>
			</div>
			<div class="flex flex-col">
				<span class="font-bold text-surface-800">Prior Knowledge:</span>
				<ul class="list-inside">
					{#if pubView.publication.prerequisites.length === 0}
						<span class="text-surface-800">No prior knowledge has been indicated</span>
					{:else}
						{#each pubView.publication.prerequisites as pk}
							<li class="list text-surface-700 text-sm list-disc">{pk}</li>
						{/each}
					{/if}
				</ul>
			</div>
		</div>
	{/key}
</div>
