<script lang="ts">
	import type { User } from '@prisma/client';
	import { Tag, UserProp } from '$lib';
	import MetadataLOandPK from '$lib/components/MetadataLOandPK.svelte';

	type UserWithProfilePic = User & { profilePicData: string };

	export let title:string;
	export let description: string;
	export let tags: string[];
	export let LOs: string[];
	export let prior: string[];
	export let maintainers: UserWithProfilePic[];
	export let publisher: UserWithProfilePic;

	// todo: ask bobby and remove if unnecessary.
	// let p = $page.data.session?.user as User & {profilePic: string};
	// let publisher = {
	// 	id: p.id,
	// 	firstName: p.firstName,
	// 	lastName: p.lastName,
	// 	username: p.username,
	// 	aboutMe: p.aboutMe,
	// 	email: p.email,
	// 	emailVerified: p.emailVerified,
	// 	reputation: p.reputation,
	// 	password: p.password,
	// 	isAdmin: p.isAdmin,
	// 	createdAt: p.createdAt,
	// 	updatedAt: p.updatedAt
	// }

</script>

<div class="flex flex-col gap-2 pl-3">
	<h2 class="text-2xl max-w-full break-words">Title: <br> {title}</h2>
	<p class="text-lg break-words max-w-full">Description: <br> {description}</p>
</div>

<p class="text-lg pl-3">Tags: </p>
<div class="flex flex-wrap gap-2 pl-3">
	{#each tags as tag}
		<Tag tagText="{tag}" removable="{false}" width="{12}" />
	{/each}
</div>

<MetadataLOandPK bind:LOs={LOs} bind:priorKnowledge={prior} adding="{false}"/>

<p class="text-lg pl-3">Maintainers:</p>
<div class="flex flex-wrap gap-2 pl-3">
	<UserProp role="Publisher" view="publish" user={publisher} userPhotoUrl={publisher.profilePicData}/>
	{#each maintainers as maintainer (maintainer.id)}
		<UserProp user={maintainer} view="publish"
							role="Publisher" userPhotoUrl={maintainer.profilePicData} />
	{/each}
</div>










