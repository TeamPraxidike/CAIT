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

    let course = data.course

</script>

<Meta title="Course" description="CAIT" type="site" />

<!-- <UserProfileBar user={user} userPhotoUrl={profilePic.data} bind:tabset={tabSet}/> -->

<CourseProfileBar course={course}></CourseProfileBar>

<div class="col-span-8">
    
</div>
