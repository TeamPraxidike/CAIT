<script lang="ts">
	import { Meta, PublicationCard, UserProfileBar } from '$lib';
    import CourseProfileBar  from '$lib/components/course/CourseProfileBar.svelte';
	import type { LayoutData, PageServerData } from './$types';
    import { type Material, type Publication, PublicationType, type Tag, type User } from '@prisma/client';
	import type { FetchedFileItem } from '$lib/database';
	import { page } from '$app/state';
	import { TabGroup, Tab } from '@skeletonlabs/skeleton';
    import type { ExtendedPublication } from '../../api/publication/+server';

	/* This is the data that was returned from the server */
	export let data: LayoutData & PageServerData;

    let course = data.course;
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

<Meta title="Course" description="CAIT" type="site" />

<!-- <UserProfileBar user={user} userPhotoUrl={profilePic.data} bind:tabset={tabSet}/> -->

<CourseProfileBar ></CourseProfileBar>

<div class="col-span-8">
    asdf
</div>
