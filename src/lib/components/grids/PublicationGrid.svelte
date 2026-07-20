<script>
	import { PublicationCard } from '$lib';

	export let publications;
	export let emptyMessage;
	export let liked;
	export let data;
	export let getEncapsulatingType;
</script>

{#if publications.length === 0}
	<p class="col-span-2 text-center">{emptyMessage}</p>
{:else}
	<div class="grid grid-cols-2 gap-4">
		{#each publications as publication, i}
			<div class="col-span-1">
				<PublicationCard imgSrc={publication.coverPicData}
								 publication={publication}
								 liked={liked.includes(publication.id)}
								 saved={data.savedByUser.includes(publication.id)}
								 publisher={publication.publisher}
								 materialType={getEncapsulatingType(publication)}/>
			</div>
		{/each}
	</div>
{/if}