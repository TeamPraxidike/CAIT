<script lang="ts">
	import TimeEstimate from '$lib/components/publication/TimeEstimate.svelte';
	import MetadataLOandPK from '$lib/components/MetadataLOandPK.svelte';
	import MantainersEditBar from '$lib/components/user/MantainersEditBar.svelte';
	import TagsSelect from '$lib/components/TagsSelect.svelte';
	import type { ParamsImmutable, ParamsMutable, ParamsMutableMaterial } from '$lib/util/frontendTypes.ts';
	import CopyrightPopup from '../CopyrightPopup.svelte';

	export let data: ParamsMutable;
	export let dataMaterial: ParamsMutableMaterial | null;
	export let paramsImmutable: ParamsImmutable;
	let popupOpen = false;

	const handleInputEnter = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			event.preventDefault();
		}
	};
	let licenseValue = '';
	let customLicenseText = '';

	function handleApply(event: CustomEvent) {
		licenseValue = event.detail.value;
		customLicenseText = event.detail.customLicenseText;
		popupOpen = false;
		if (dataMaterial){
			dataMaterial.copyright = licenseValue;
		}
  	}


</script>

<div class="flex flex-col gap-6 mt-3">


	{#if dataMaterial}
		<div class="flex flex-col md:flex-row col-span-full items-center gap-10">
			<TimeEstimate bind:totalMinutes={dataMaterial.estimate}/>
			<div class="w-full md:w-1/2	">
				<label for="copyright md-2" class="block font-medium">Copyright License (<a
					href="https://www.tudelft.nl/library/support/copyright#c911762" target=”_blank”
					class="text-tertiary-700"> Check here how this applies to you</a>):</label>
				<div class="flex flex-row ">
					<input type="text" name="copyright" bind:value={dataMaterial.copyright} on:keydown={handleInputEnter}
						placeholder="Enter License"
						class="mt-1 mr-1 rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:border-primary-500 focus:ring-0">
					
						<button
							class="inline-flex items-center shrink-0 p-2 text-white bg-primary-600 hover:bg-primary-500 rounded-xl shadow-md transition duration-200 dark:text-surface-50 disabled:cursor-not-allowed disabled:opacity-50"
							on:click={()=> (popupOpen = true)}
							disabled={dataMaterial.selfMade === null}
							type="button">
							License picker
						</button>
					{#if popupOpen}
						<CopyrightPopup
							ownershipStatus={dataMaterial.selfMade === true ? 'yes' : dataMaterial.selfMade === false ? 'no' : null}
							on:close={()=>(popupOpen = false)}
							on:apply={handleApply}/>
						
					{/if}
				</div>

			</div>
		</div>

		<fieldset class="w-full">
			<legend class="font-medium">
				Did you make this material yourself?<span class="text-error-500">*</span>
			</legend>
			<p class="mt-1 text-sm text-surface-500 dark:text-surface-400">
				Your answer determines which licensing guidance is shown.
			</p>
			<div class="mt-3 flex flex-wrap gap-3">
				<button
					type="button"
					on:click={() => dataMaterial && (dataMaterial.selfMade = true)}
					aria-pressed={dataMaterial.selfMade === true}
					class:!bg-primary-600={dataMaterial.selfMade === true}
					class:!text-white={dataMaterial.selfMade === true}
					class="rounded-xl border border-surface-400 bg-surface-50 px-4 py-2 text-sm font-medium text-surface-800 hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-50">
					Yes, I made it
				</button>
				<button
					type="button"
					on:click={() => dataMaterial && (dataMaterial.selfMade = false)}
					aria-pressed={dataMaterial.selfMade === false}
					class:!bg-primary-600={dataMaterial.selfMade === false}
					class:!text-white={dataMaterial.selfMade === false}
					class="rounded-xl border border-surface-400 bg-surface-50 px-4 py-2 text-sm font-medium text-surface-800 hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-50">
					No, someone else made it
				</button>
			</div>
			{#if dataMaterial.selfMade === null}
				<p class="mt-2 text-sm text-error-500">Choose an answer before opening the license picker.</p>
			{/if}
		</fieldset>
	{/if}

	<div class="w-full">
		<MetadataLOandPK bind:LOs={data.LOs} bind:priorKnowledge={data.PKs}
						 adding="{true}"/>
	</div>
	<div class="w-full">
		<MantainersEditBar publisher={data.loggedUser} bind:searchableUsers={data.searchableUsers} users={paramsImmutable.users}
						   bind:additionalMaintainers={data.maintainers} />
	</div>
	<div class="lg:w-1/2">
		<TagsSelect allTags={paramsImmutable.allTags} bind:tags={data.tags} bind:newTags={data.newTags}/>
	</div>

	<textarea name="description" placeholder="Additional Description..." bind:value={data.description}
			  class="min-h-60 rounded-lg h-full resize-y dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-200 focus:border-primary-500 focus:ring-0" />
</div>
