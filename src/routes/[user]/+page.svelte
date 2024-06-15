<script lang="ts">
	import { Meta, PublicationCard, UserProfileBar } from '$lib';
	import type { LayoutData, PageServerData } from './$types';
	import { type Publication, type Tag, type User } from '@prisma/client';
	import type { FetchedFileItem } from '$lib/database';
	import { page } from '$app/stores';
	import { TabGroup, Tab } from '@skeletonlabs/skeleton';

	/* This is the data that was returned from the server */
	export let data: LayoutData & PageServerData;

    let user:User & {
        posts: Publication & {
            tags: Tag[];
        }[]
    } = data.user;
    let profilePic: FetchedFileItem = data.profilePicData;


    // let saved = data.saved;
    // let savedFileData = data.savedFileData;

    let liked = data.liked;

    let saved:(Publication & {
            tags: Tag[];
            usedInCourse: {course: string}[];
            coverPicData: string;
			publisher: User & {profilePicData: string};
        })[] = data.saved;

    let posts : (Publication & {
        tags: Tag[];
        usedInCourse: {course: string}[]
        coverPicData: string
		    publisher: User & {profilePicData: string}
    })[] = data.publications.publications;

    let tabSet: number = 0;
</script>

<Meta title="Profile" description="CAIT" type="site" />

<UserProfileBar user={user} userPhotoUrl={'data:image;base64,' + profilePic.data} />

<div class="col-span-8">
    {#if $page.data.session?.user.id === user.id}
        <TabGroup justify="justify-center" class="col-span-8 lg:col-span-full">
            <Tab bind:group={tabSet} name="tab1" value={0}>
                <p>Saved Publications</p>
            </Tab>
            <Tab bind:group={tabSet} name="tab2" value={1}>
                <p>Your Publications</p>
            </Tab>
            <svelte:fragment slot="panel">
                {#if tabSet === 0}
                    <div class="grid grid-cols-2 gap-4">
                        {#if saved.length !== 0}
                            {#each saved as publication}
                                <div class="col-span-1">
                                    <PublicationCard imgSrc={'data:image;base64,' + publication.coverPicData} {publication} liked={liked.includes(publication.id)} markAsUsed={true} courses={publication.usedInCourse.map(x => x.course)} publisher={publication.publisher}/>
                                </div>
                            {/each}
                        {/if}
                    </div>
                {:else if tabSet === 1}
                    {#if posts.length === 0}
                        <p class="col-span-2 text-center">So empty... There are no publications here </p>
                    {:else}
                        <div class="grid grid-cols-2 gap-4">
                        {#each posts as publication, i}
                            <div class="col-span-1">
                            <PublicationCard imgSrc={'data:image;base64,' + publication.coverPicData}
                                             publication={publication}
                                             liked={liked.includes(publication.id)}
                                             courses={posts[i].usedInCourse.map(x => x.course)}
                                             saved={data.savedByUser.includes(publication.id)}
                                             publisher={publication.publisher}/>
                            </div>
                        {/each}
                        </div>
                    {/if}
                {/if}
            </svelte:fragment>
        </TabGroup>
    {:else}
            <h3 class="text-xl mt-8 text-surface-900 col-span-full text-center dark:text-surface-50">
                {user.firstName}'s Publications
            </h3>
            {#if posts.length === 0}
                <p class="col-span-full text-center">So empty... There are no publications here</p>
            {:else}
                <div class="grid grid-cols-2 gap-4">
                {#each posts as publication, i}
                    <PublicationCard imgSrc={'data:image;base64,' + publication.coverPicData}
                                     publication={publication}
                                     liked={liked.includes(publication.id)}
                                     courses={posts[i].usedInCourse.map(x => x.course)}
                                     saved={data.savedByUser.includes(publication.id)}
                                     publisher={publication.publisher}/>
                {/each}
                </div>
            {/if}
    {/if}
</div>
