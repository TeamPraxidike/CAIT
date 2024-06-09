<script lang="ts">
    import {Meta, PublicationCard, UserProfileBar} from "$lib";
    import type {LayoutData, PageServerData} from './$types';
    import {type Material, type Publication, PublicationType, type Tag, type User} from '@prisma/client';
    import type {FetchedFileItem} from '$lib/database';
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
    let savedFileData = data.savedFileData;
    console.log(savedFileData)

    let liked = data.liked;

    let saved:(Publication & {
            tags: Tag[];
            usedInCourse: {course: string}[]
        })[] = data.saved;


    let posts : (Material & {
        publication: Publication & {usedInCourse: {course: string}[], tags: Tag[]},
        coverPicData: string
    })[] = data.materials.filter((x: any) => x.publication.type !== PublicationType.Circuit);
    let tabSet: number = 0;
</script>

<Meta title="Profile" description="CAIT" type="site"/>

<div class="col-span-full xl:flex xl:flex-row xl:space-x-5
                            lg:flex lg:flex-row lg:space-x-5">

    <UserProfileBar user={user} userPhotoUrl={'data:image;base64,' + profilePic.data}/>

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
                    <div class="grid grid-cols-4 gap-4 mb-20">
                        {#if saved.length !== 0}
                            {#each saved as publication, i}
                                <div class="col-span-4 md:col-span-2 lg:col-span-2 xl:col-span-2">
                                    <PublicationCard imgSrc={'data:image;base64,' + savedFileData[i].data} {publication} liked={liked.includes(publication.id)} markAsUsed={true} courses={publication.usedInCourse.map(x => x.course)}/>
                                </div>
                            {/each}
                        {/if}
                    </div>
                {:else if tabSet === 1}
                    <div class="grid grid-cols-4 gap-4 mb-20">
                        {#if posts.length === 0}
                            <p class="col-span-4 text-center">So empty... There are no publications here </p>
                        {:else}
                            {#each posts as publication, i}
                                <div class="col-span-4 md:col-span-2 lg:col-span-2 xl:col-span-2">
                                    <PublicationCard imgSrc={'data:image;base64,' + publication.coverPicData}
                                                     publication={publication.publication}
                                                     liked={liked.includes(publication.publicationId)}
                                                     courses={posts[i].publication.usedInCourse.map(x => x.course)}
                                                     saved={data.savedByUser.includes(publication.publicationId)}/>
                                </div>
                            {/each}
                        {/if}
                    </div>
                {/if}
            </svelte:fragment>
        </TabGroup>
    {:else}
        <div class="grid grid-cols-4 gap-4 mb-20
               md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4">
            <h3 class="text-xl mt-8 text-surface-900 col-span-full text-center dark:text-surface-50">
                {user.firstName}'s Publications
            </h3>
            {#if posts.length === 0}
                <p class="col-span-full text-center">So empty... There are no publications here</p>
            {:else}
                {#each posts as publication, i}
                    <div class="col-span-4 md:col-span-2 lg:col-span-2 xl:col-span-2">
                        <PublicationCard imgSrc={'data:image;base64,' + publication.coverPicData}
                                         publication={publication.publication}
                                         liked={liked.includes(publication.publicationId)}
                                         courses={posts[i].publication.usedInCourse.map(x => x.course)}
                                         saved={data.savedByUser.includes(publication.publicationId)}/>
                    </div>
                {/each}
            {/if}
        </div>
    {/if}
</div>


