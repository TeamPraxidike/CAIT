<script lang="ts">
	import { Meta, PublicationCard, UserProfileBar } from '$lib';
	import type { LayoutData, PageServerData } from './$types';
    import { type Material, type Publication, PublicationType, type Tag, type User } from '@prisma/client';
	import type { FetchedFileItem } from '$lib/database';
	import { page } from '$app/state';
	import { TabGroup, Tab } from '@skeletonlabs/skeleton';
    import type { ExtendedPublication } from '../api/publication/+server';

	/* This is the data that was returned from the server */
	export let data: LayoutData & PageServerData;

    let user = data.user;
    let profilePic: FetchedFileItem = data.profilePic;
    // let saved = data.saved;
    // let savedFileData = data.savedFileData;

    let liked = data.liked;

    type publication = (Publication & {
        materials: Material,
        tags: Tag[];
        usedInCourse: {course: string}[];
        coverPicData: string;
        publisher: User & {profilePicData: string};
    });
    let saved: publication[] = data.saved;
    let posts = data.publications || [] as ExtendedPublication[];
    let tabSet: number = 0;


    function transformPosts(posts: ExtendedPublication[]): publication[] {
        return posts
            .map((publication) => publication as publication)
    }


    let cardPosts = transformPosts(posts).filter(x => !x.isDraft);
    let cardDrafts = transformPosts(posts).filter(x => x.isDraft);


    const getEncapsulatingType = (publication: any): string => {
        if(publication.type === PublicationType.Material) return publication.materials.encapsulatingType;
        else return PublicationType.Circuit;
    }
</script>

<Meta title="Profile" description="CAIT" type="site" />

<UserProfileBar user={user} userPhotoUrl={profilePic.data} bind:tabset={tabSet}/>



<div class="col-span-8">
    {#if page.data.session?.user.id === user.id}
        <TabGroup justify="justify-center" class="col-span-8 lg:col-span-full">
            <Tab bind:group={tabSet} name="tab1" value={1}>
                <p>Saved Publications</p>
            </Tab>
            <Tab bind:group={tabSet} name="tab2" value={0}>
                <p>Your Publications</p>
            </Tab>
            <Tab bind:group={tabSet} name="tab3" value={2}>
                <p>Draft Publications</p>
            </Tab>
            <svelte:fragment slot="panel">
                {#if tabSet === 0}
                    {#if posts.length === 0}
                        <p class="col-span-2 text-center">So empty... There are no publications here </p>
                    {:else}
                        <div class="grid grid-cols-2 gap-4">
                            {#each cardPosts as publication, i}
                                <div class="col-span-1">
                                    <PublicationCard imgSrc={publication.coverPicData}
                                                     publication={publication}
                                                     liked={liked.includes(publication.id)}
                                                     courses={posts[i].usedInCourse.map(x => x.course)}
                                                     saved={data.savedByUser.includes(publication.id)}
                                                     publisher={publication.publisher}
                                                     materialType={getEncapsulatingType(publication)}/>
                                </div>
                            {/each}
                        </div>
                    {/if}
                {:else if tabSet === 1}
                    <div class="grid grid-cols-2 gap-4">
                        {#if saved.length !== 0}
                            {#each saved as publication}
                                <div class="col-span-1">
                                    <PublicationCard imgSrc={publication.coverPicData}
                                                     {publication} liked={liked.includes(publication.id)}
                                                     markAsUsed={true}
                                                     courses={publication.usedInCourse.map(x => x.course)}
                                                     publisher={publication.publisher}
                                                     materialType={getEncapsulatingType(publication)}/>
                                </div>
                            {/each}
                        {/if}
                    </div>
                {:else if tabSet === 2}
                    {#if posts.length === 0}
                        <p class="col-span-2 text-center">You don't have any draft publications</p>
                    {:else}
                        <div class="grid grid-cols-2 gap-4">
                            {#each cardDrafts as publication, i}
                                <div class="col-span-1">
                                    <PublicationCard imgSrc={publication.coverPicData}
                                                     publication={publication}
                                                     liked={liked.includes(publication.id)}
                                                     courses={posts[i].usedInCourse.map(x => x.course)}
                                                     saved={data.savedByUser.includes(publication.id)}
                                                     publisher={publication.publisher}
                                                     materialType={getEncapsulatingType(publication)}/>
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
                {#each cardPosts as publication, i}
                    <PublicationCard imgSrc={publication.coverPicData}
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
