<script lang="ts">
	import {
		AddInteractionForm,
		Meta,
		PublicationCard,
		UserProfileBar,
		Comment,
	} from '$lib';
	import CourseProfileBar from '$lib/components/course/CourseProfileBar.svelte';
	import type { LayoutData, PageServerData } from './$types';
	import {
		type Material,
		type Publication,
		PublicationType,
		type Tag,
		type User,
		type Reply,
		type Comment as PrismaComment,
	} from '@prisma/client';
	import type { FetchedFileItem } from '$lib/database';
	import { page } from '$app/state';
	import { TabGroup, Tab } from '@skeletonlabs/skeleton';
	import type { ExtendedPublication } from '../../api/publication/+server';

	/* This is the data that was returned from the server */
	export let data: LayoutData & PageServerData;
	let comments: (PrismaComment & {
		replies: (Reply & { user: User & { profilePicData: string } })[];
		user: User & { profilePicData: string };
	})[] = [];

	let likedComments: number[] = [];
	let likedReplies: number[] = [];

	let course = data.course;

	let tabSet: number = 0;
	let loggedUser = page.data.loggedUser;

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
			user: loggedUser,
		};
		comments = [...comments, comment];
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
				likedReplies = likedReplies.filter((x) => x !== id);
			}
		} else {
			if (liked) {
				likedComments.push(id);
			} else {
				likedComments = likedComments.filter((x) => x !== id);
			}
		}
	};

	const addReply = (event: CustomEvent) => {
		let commentIndex = comments.findIndex(
			(c) => c.id === event.detail.content.commentId,
		);
		const replies = [
			...comments[commentIndex].replies,
			{
				likes: 0,
				user: loggedUser,
				...event.detail.content
			},
		];
		if (commentIndex !== -1) {
			comments[commentIndex] = {
				...comments[commentIndex],
				replies: replies,
			};
			comments = [...comments];
		}
	};
</script>

<Meta
	title="Course"
	description="CAIT"
	type="site" />

<!-- <UserProfileBar user={user} userPhotoUrl={profilePic.data} bind:tabset={tabSet}/> -->

<CourseProfileBar {course}></CourseProfileBar>

<div class="col-span-8">
	<TabGroup>
		<Tab
			bind:group={tabSet}
			name="Materials"
			value={0}>
			Materials
		</Tab>
		<Tab
			bind:group={tabSet}
			name="Discussion"
			value={1}>
			Discussion
		</Tab>
		<Tab
			bind:group={tabSet}
			name="Related"
			value={2}>
			Related
		</Tab>
		<svelte:fragment slot="panel">
			{#if tabSet === 0}
				{#await data.pubsInCourse}
					<p>loading publications</p>
				{:then x}
					{#each x as publication (publication.id)}
						<!-- TODO: FIX IMGSRC, LIKED and SAVED -->
						<PublicationCard
							imgSrc={null} 
							publication={publication}
							liked={undefined}
							saved={undefined}
							materialType={publication.type}
							publisher={publication.publisher}
							className="col-span-1" />
					{/each}
				{:catch error}
					<p>Error</p>
				{/await}
			{:else if tabSet === 1}
				<!-- TODO: add course comment functionality -->
				<span class="bg-red-600"
					>Currently commenting does not work, as courses do not
					support comments to be added</span>
				<!--    DISCUSSION -->
				{#if data.session?.user && course?.id}
					<AddInteractionForm
						publisher={loggedUser}
						on:addedReply={addComment}
						addComment={true}
						commentId={1}
						publicationId={course.id} />
				{/if}

				{#each comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as comment (comment.id)}
					<Comment
						commenter={loggedUser}
						on:likeUpdate={updateLikes}
						on:ReplyAction={addReply}
						interaction={comment}
						photoUrl={comment.user.profilePicData}
						isReply={false}
						userName="{comment.user.firstName} {comment.user
							.lastName}"
						liked={likedComments.includes(comment.id)} />
					{#each comment.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) as reply (reply.id)}
						<Comment
							commenter={loggedUser}
							on:likeUpdate={updateLikes}
							interaction={reply}
							isReply={true}
							photoUrl={reply.user.profilePicData}
							userName="{reply.user.firstName} {reply.user
								.lastName}"
							liked={likedReplies.includes(reply.id)} />
					{/each}
				{/each}
			{:else if tabSet === 2}
				
				<span class="bg-red-600"
					>Currently related work is not yet being retrieved</span>
			{/if}
		</svelte:fragment>
	</TabGroup>
</div>
