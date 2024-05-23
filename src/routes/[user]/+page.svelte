<script lang="ts">
    import {Meta, PublicationCard, UserProfileBar} from "$lib";
    import type {LayoutData, PageServerData} from './$types';
    import type { Publication, Tag, User } from '@prisma/client';
    import type {FetchedFileArray, FetchedFileItem} from '$lib/database';

    /* This is the data that was returned from the server */
    export let data: LayoutData & PageServerData;

    let user:User & {
        posts: Publication & {
            tags: Tag[];
        }[]
    } = data.user;

    let profilePic: FetchedFileItem = data.profilePicData;

    let fileData:FetchedFileArray = data.fileData;


</script>

<Meta title="Profile" description="CAIT" type="site"/>

<UserProfileBar user={user} userPhotoUrl={'data:image;base64,' + profilePic.data}/>

<div class="grid grid-cols-3 gap-4 mb-20
            md:col-span-8 lg:col-span-12 xl:col-span-8">
    <h3 class="text-xl mt-8 text-surface-900 col-span-3 text-center dark:text-surface-50">
        Saved Publications
    </h3>
    {#each data.user.posts as publication, i}
        <PublicationCard imgSrc={'data:image;base64,' + fileData[i].data} {publication} />
    {/each}
    <h3 class="text-xl mt-8 text-surface-900 col-span-3 text-center dark:text-surface-50">
        Franklin's Publications
    </h3>
    {#each data.user.posts as publication, i}
        <PublicationCard imgSrc={'data:image;base64,' + fileData[i].data} {publication} />
    {/each}
</div>


