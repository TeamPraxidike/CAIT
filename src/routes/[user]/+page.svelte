<script lang="ts">
	import { Meta, UserProfileBar } from '$lib';
	import type { LayoutData, PageServerData } from './$types';
    import { type Material, type Publication, PublicationType, type Tag, type User } from '@prisma/client';
	import type { FetchedFileItem } from '$lib/database';
	import { page } from '$app/state';
	import { TabGroup, Tab } from '@skeletonlabs/skeleton';
    import type { ExtendedPublication } from '../api/publication/+server';
	import PublicationGrid from '$lib/components/grids/PublicationGrid.svelte';
	import CourseGrid from '$lib/components/grids/CourseGrid.svelte';

	/* This is the data that was returned from the server */
	export let data: LayoutData & PageServerData;

    type publication = (Publication & {
        materials: Material,
        tags: Tag[];
        coverPicData: string;
        publisher: User & {profilePicData: string};
    });
    const getSelectedTab = () => page.url.searchParams.get('tab') === 'drafts' ? 2 : 0;

    let tabSet: number = getSelectedTab();
    let currentProfileId = data.user.id;

    let user = data.user;
    let profilePic: FetchedFileItem = data.profilePic;
    let liked = data.liked;
    let saved: publication[] = data.saved;
    let posts = data.publications || [] as ExtendedPublication[];
	let courses = data.coursesWithPics;

    $: user = data.user;
    $: profilePic = data.profilePic;
    $: liked = data.liked;
    $: saved = data.saved;
    $: posts = data.publications || [] as ExtendedPublication[];

    $: if (data.user.id !== currentProfileId) {
        currentProfileId = data.user.id;
        tabSet = getSelectedTab();
    }

    $: if (page.url.searchParams.get('tab') === 'drafts') {
        tabSet = 2;
    }

	let publicTabSet = 0;

    function transformPosts(posts: ExtendedPublication[]): publication[] {
        return posts
            .map((publication) => publication as publication)
    }


    let cardPosts: publication[] = [];
    let cardDrafts: publication[] = [];

    $: cardPosts = transformPosts(posts).filter(x => !x.isDraft);
    $: cardDrafts = transformPosts(posts).filter(x => x.isDraft);


    const getEncapsulatingType = (publication: any): string => {
        if(publication.type === PublicationType.Material) return publication.materials.encapsulatingType;
        else return PublicationType.Circuit;
    }
</script>

<Meta title="Profile" description="CAIT" type="site" />

<UserProfileBar user={user} userPhotoUrl={profilePic.data} bind:tabset={tabSet} memberSince={data.memberSince}/>



<div class="col-span-8">
	{#if page.data.session?.user.id === user.id}
		<TabGroup justify="justify-center" class="col-span-8 lg:col-span-full">
			<Tab bind:group={tabSet} name="tab2" value={0}>
				<p>Your Publications</p>
			</Tab>
			<Tab bind:group={tabSet} name="tab2" value={1}>
				<p>My Courses</p>
			</Tab>
			<Tab bind:group={tabSet} name="tab1" value={2}>
				<p>Saved Publications</p>
			</Tab>
			<Tab bind:group={tabSet} name="tab3" value={3}>
				<p>Draft Publications</p>
			</Tab>

			<svelte:fragment slot="panel">
				{#if tabSet === 0}
					<PublicationGrid publications={cardPosts}
									 emptyMessage="So empty... There are no publications here"
									 {liked} {data} {getEncapsulatingType} />
				{:else if tabSet === 1}
					<CourseGrid courses={courses}
							 emptyMessage="So empty... There are no courses here" />
				{:else if tabSet === 2}
					<PublicationGrid publications={saved}
									 emptyMessage="So empty... There are no saved publications"
									 {liked} {data} {getEncapsulatingType} />
				{:else if tabSet === 3}
					<PublicationGrid publications={cardDrafts}
									 emptyMessage="You don't have any draft publications"
									 {liked} {data} {getEncapsulatingType} />
				{/if}
			</svelte:fragment>
		</TabGroup>
	{:else}
		<TabGroup justify="justify-center" class="col-span-8 lg:col-span-full">
			<Tab bind:group={publicTabSet} name="publicTab1" value={0}>
				<p>Publications</p>
			</Tab>
			<Tab bind:group={publicTabSet} name="publicTab2" value={1}>
				<p>Courses</p>
			</Tab>
			<svelte:fragment slot="panel">
				{#if publicTabSet === 0}
					<PublicationGrid publications={cardPosts}
									 emptyMessage="So empty... There are no publications here"
									 {liked} {data} {getEncapsulatingType} />
				{:else if publicTabSet === 1}
					<CourseGrid courses={courses}
								emptyMessage="So empty... There are no courses here" />
				{/if}
			</svelte:fragment>
		</TabGroup>
	{/if}
</div>
