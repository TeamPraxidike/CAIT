<script lang="ts">
    import {Meta, PublicationCard, UserProfileBar} from "$lib";
    import type {LayoutData, PageServerData} from './$types';
    import { type Publication, PublicationType, type Tag, type User} from '@prisma/client';
    import type {FetchedFileItem} from '$lib/database';
    import { page } from '$app/stores';

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
    let liked = data.liked;

    let saved:(Publication & {
            tags: Tag[];
            usedInCourse: {course: string}[]
        })[] = data.saved;

    let postsPublication = data.user.posts.filter((x: any) => x.type !== PublicationType.Circuit);
    let posts: Publication & {
        tags: Tag[];
        usedInCourse: {course: string}[]
    }[] = data.user.posts.filter((x: any) => x.type !== PublicationType.Circuit);

    console.log(posts)
</script>

<Meta title="Profile" description="CAIT" type="site"/>

<UserProfileBar user={user} userPhotoUrl={'data:image;base64,' + profilePic.data}/>

<div class="grid col-span-full gap-4 mb-20
            md:col-span-8 lg:col-span-12 xl:col-span-8">
    {#if saved.length !== 0}
        <h3 class="text-xl mt-8 text-surface-900 col-span-6 text-center dark:text-surface-50">
            Saved Publications
        </h3>

        {#each data.saved as publication, i}
            <PublicationCard imgSrc={'data:image;base64,' + savedFileData[i].data} {publication} liked={liked.includes(publication.id)} markAsUsed={true} courses={saved[i].usedInCourse.map(x => x.course)}/>
        {/each}
    {/if}

    {#if $page.data.session?.user.id === user.id}
        <h3 class="text-xl mt-8 text-surface-900 col-span-6 text-center dark:text-surface-50">
            Your Publications
        </h3>
    {:else}
        <h3 class="text-xl mt-8 text-surface-900 col-span-6 text-center dark:text-surface-50">
            {user.firstName}'s Publications
        </h3>
    {/if}

    {#if postsPublication.length === 0}
        <p class="col-span-6 text-center">So empty... There are no publications here</p>
    {:else}
        {#each postsPublication as publication, i}
            <PublicationCard imgSrc={'data:image;base64,' + publication.coverPicData} {publication} liked={liked.includes(publication.id)} courses={posts[i].usedInCourse.map(x => x.course)}/>
        {/each}
    {/if}
</div>


