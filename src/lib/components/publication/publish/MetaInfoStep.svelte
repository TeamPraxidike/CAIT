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
			dataMaterial.copyright = licenseValue
		}
  	}

// let licenseValue = 'mit';

//   const licenses = [
//     {
//       value: 'mit',
//       label: 'MIT',
//       summary: 'Very permissive. Good default for open source.',
//       allowsCommercial: true,
//       requiresAttribution: true,
//       requiresCopyleft: false,
//       description:
//         'Anyone can use, modify, and distribute the software, including commercially, as long as the copyright and license notice stay with it.'
//     },
//     {
//       value: 'apache-2.0',
//       label: 'Apache 2.0',
//       summary: 'Permissive with explicit patent protection.',
//       allowsCommercial: true,
//       requiresAttribution: true,
//       requiresCopyleft: false,
//       description:
//         'Allows use, modification, and distribution, including commercial use. It also includes an explicit patent license.'
//     },
//     {
//       value: 'gpl-3.0',
//       label: 'GPL-3.0',
//       summary: 'Strong copyleft. Derivatives must stay open.',
//       allowsCommercial: true,
//       requiresAttribution: true,
//       requiresCopyleft: true,
//       description:
//         'You can use and distribute it, but modified or combined distributions generally need to remain under GPL-compatible terms.'
//     }
// ]
//   $: selectedLicense =
//     licenses.find((item) => item.value === licenseValue) ?? licenses[0];
</script>

<div class="flex flex-col gap-6 mt-3">


	{#if dataMaterial}
		<div class="flex flex-col md:flex-row col-span-full items-center gap-10">
			<TimeEstimate bind:totalMinutes={dataMaterial.estimate}/>
			<div class="w-full md:w-1/2	">
			
<!-- <label class="block space-y-2">
  <span class="text-sm font-medium">License</span>

  <select
    bind:value={licenseValue}
    class="w-64 rounded-md border bg-white px-3 py-2 text-sm"
  >
    {#each licenses as item}
      <option value={item.value}>{item.label}</option>
    {/each}
  </select>
</label>

<div class="mt-4 w-96 rounded-lg border bg-white p-4 space-y-3">
  <div>
    <h3 class="text-sm font-semibold">{selectedLicense.label}</h3>
    <p class="text-sm text-gray-600">{selectedLicense.summary}</p>
  </div>

  <p class="text-sm text-gray-700">
    {selectedLicense.description}
  </p>

  <div class="grid grid-cols-1 gap-2 text-sm">
    <div class="flex items-center justify-between rounded border px-3 py-2">
      <span>Commercial use</span>
      <span>{selectedLicense.allowsCommercial ? 'Yes' : 'No'}</span>
    </div>

    <div class="flex items-center justify-between rounded border px-3 py-2">
      <span>Attribution required</span>
      <span>{selectedLicense.requiresAttribution ? 'Yes' : 'No'}</span>
    </div>

    <div class="flex items-center justify-between rounded border px-3 py-2">
      <span>Copyleft</span>
      <span>{selectedLicense.requiresCopyleft ? 'Yes' : 'No'}</span>
    </div>
  </div>
</div> -->
				<label for="copyright md-2" class="block font-medium">Copyright License (<a
					href="https://www.tudelft.nl/library/support/copyright#c911762" target=”_blank”
					class="text-tertiary-700"> Check here how this applies to you</a>):</label>
				<div class="flex flex-row ">
					<input type="text" name="copyright" bind:value={dataMaterial.copyright} on:keydown={handleInputEnter}
						placeholder="Enter License"
						class="mt-1 mr-1 rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400 focus:border-primary-500 focus:ring-0">
					
						<button class="inline-flex items-center shrink-0 p-2 text-white bg-primary-600 hover:bg-primary-500 rounded-xl shadow-md transition duration-200 dark:text-surface-50" on:click={()=> (popupOpen = true)}> License picker </button>
					{#if popupOpen}
						<CopyrightPopup on:close={()=>(popupOpen = false)} on:apply={handleApply}/>
						
					{/if}
				</div>

			</div>
		</div>
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