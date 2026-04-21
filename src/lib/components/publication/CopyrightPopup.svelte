<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let open = false;
	export let initialValue = '';
	export let initialCustomLicenseText = '';

	type LicenseOption = {
		value: string;
		label: string;
		summary: string;
		description: string;
		allowsCommercial: boolean;
		allowsDerivatives: boolean;
		requiresSameLicense: boolean;
		waivesRights: boolean;
	};

	type OwnershipStatus = 'yes' | 'no' | null;

	const licenses: LicenseOption[] = [
		{
			value: 'CC BY',
			label: 'CC BY',
			summary: 'Attribution required. Commercial use and adaptations allowed.',
			description:
				'Others may copy, distribute, remix, adapt, and build upon the work, including for commercial purposes, as long as they give appropriate credit.',
			allowsCommercial: true,
			allowsDerivatives: true,
			requiresSameLicense: false,
			waivesRights: false
		},
		{
			value: 'CC BY-SA',
			label: 'CC BY-SA',
			summary:
				'Attribution required. Adaptations allowed, must use the same license.',
			description:
				'Others may reuse and adapt the work, including commercially, but adaptations must be shared under the same license terms.',
			allowsCommercial: true,
			allowsDerivatives: true,
			requiresSameLicense: true,
			waivesRights: false
		},
		{
			value: 'CC BY-ND',
			label: 'CC BY-ND',
			summary:
				'Attribution required. Commercial use allowed. No derivatives allowed.',
			description:
				'Others may reuse and redistribute the work, including commercially, but they may not share modified versions.',
			allowsCommercial: true,
			allowsDerivatives: false,
			requiresSameLicense: false,
			waivesRights: false
		},
		{
			value: 'CC BY-NC',
			label: 'CC BY-NC',
			summary: 'Attribution required. Non-commercial use only.',
			description:
				'Others may reuse, remix, adapt, and build upon the work, but not for commercial purposes, and they must provide attribution.',
			allowsCommercial: false,
			allowsDerivatives: true,
			requiresSameLicense: false,
			waivesRights: false
		},
		{
			value: 'CC BY-NC-SA',
			label: 'CC BY-NC-SA',
			summary:
				'Attribution required. Non-commercial use only. Adaptations must use the same license.',
			description:
				'Others may adapt and build upon the work for non-commercial purposes only, must credit you, and must license derivatives under the same terms.',
			allowsCommercial: false,
			allowsDerivatives: true,
			requiresSameLicense: true,
			waivesRights: false
		},
		{
			value: 'CC BY-NC-ND',
			label: 'CC BY-NC-ND',
			summary:
				'Attribution required. Non-commercial use only. No derivatives allowed.',
			description:
				'Others may download and share the work with attribution, but they may not change it or use it commercially.',
			allowsCommercial: false,
			allowsDerivatives: false,
			requiresSameLicense: false,
			waivesRights: false
		}
	];

	const predefinedValues = new Set(licenses.map((item) => item.value));

	let ownershipStatus: OwnershipStatus = null;
	let customMode = false;
	let customLicenseText = '';
	let selectedLicenseValue = '';

	function resetState() {
		const hasKnownInitialValue = initialValue && predefinedValues.has(initialValue);

		ownershipStatus = null;
		customMode = !!initialValue && !hasKnownInitialValue;
		selectedLicenseValue = hasKnownInitialValue ? initialValue : '';
		customLicenseText =
			customMode ? initialValue : initialCustomLicenseText || '';
	}

	$: if (open) {
		resetState();
	}

	$: selectedLicense =
		licenses.find((item) => item.value === selectedLicenseValue) ?? null;

	$: ownershipReference =
		ownershipStatus === 'yes'
			? {
					imageSrc: '/images/copyright/copyright_creative_commons.jpg',
					imageAlt: 'Reference image for users who own the material',
					infoHref: 'https://www.tudelft.nl/library/support/copyright',
					infoLabel: 'More info about licence usage at the TU Delft'
				}
			: ownershipStatus === 'no'
				? {
						imageSrc: '/images/copyright/copyright_combinations.png',
						imageAlt: 'Reference image for users who do not own the material',
						infoHref: 'https://meta.wikimedia.org/wiki/Open_Content_-_A_Practical_Guide_to_Using_Creative_Commons_Licences/The_Creative_Commons_licencing_scheme#Mixing_SA_material_with_Open_Content_under_different_licences_%E2%80%93_the_licence_compatibility_problem',
						infoLabel: 'More info about license compatability'
					}
				: null;

	function close() {
		dispatch('close');
	}

	function apply() {
		const value = customMode ? customLicenseText.trim() : selectedLicenseValue;

		dispatch('apply', {
			value,
			customLicenseText: customMode ? customLicenseText.trim() : '',
			suggestedLicense: customMode ? 'Custom' : selectedLicenseValue,
			ownershipStatus
		});
	}

	function setCustomMode() {
		customMode = true;
		if (!customLicenseText && initialValue && !predefinedValues.has(initialValue)) {
			customLicenseText = initialValue;
		}
	}

	function setSuggestedMode() {
		customMode = false;
	}

	function chooseOwnership(value: 'yes' | 'no') {
		ownershipStatus = value;
	}

	function goBackToOwnershipStep() {
		ownershipStatus = null;
	}

	$: canApply =
		ownershipStatus !== null &&
		(customMode
			? customLicenseText.trim().length > 0
			: selectedLicenseValue.length > 0);
</script>

<div class="fixed inset-0 z-[11000] overflow-y-auto bg-black/50">
	<div class="flex min-h-full items-start justify-center p-4 sm:items-center">
		<div
			class="z-[11000] max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-surface-50 shadow-2xl dark:bg-surface-800">
			<div
				class="flex items-center justify-between border-b border-surface-200 px-6 py-4 dark:border-surface-700">
				<div>
					<h2 class="text-lg font-semibold text-surface-900 dark:text-surface-100">
						Choose a license
					</h2>
					<p class="mt-1 text-sm text-surface-600 dark:text-surface-400">
						First tell us whether you own the material, then choose a license or enter a custom one.
					</p>
				</div>

				<button
					type="button"
					on:click={close}
					class="rounded-lg px-2 py-1 text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-700 dark:hover:text-surface-200"
					aria-label="Close">
					✕
				</button>
			</div>

			<div class="max-h-[calc(90vh-145px)] space-y-6 overflow-y-auto px-6 py-5">
				<!-- <div class="rounded-xl border border-gray-200 bg-surface-50 p-4">
					<div>
						<h3 class="text-sm font-semibold text-gray-900">Current value</h3>
						<p class="mt-1 text-sm text-gray-600">
							{initialValue || 'No license selected'}
						</p>
					</div>
				</div> -->

					<div class="rounded-xl border border-gray-200 bg-surface-50 p-4">
						<div class="mb-4">
							<h3 class="text-sm font-semibold text-gray-900">
								Do you own the material?
							</h3>
							<p class="mt-1 text-sm text-gray-600">
								This determines which guidance we show before you choose a license.
							</p>
						</div>

						<div class="flex flex-wrap gap-3">
							<button
								type="button"
								on:click={() => chooseOwnership('yes')}
								class:!bg-surface-900={ownershipStatus === 'yes'}
								class:!text-white={ownershipStatus === 'yes'}
								class:!border-surface-900={ownershipStatus === 'yes'}
								class="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-surface-100">
								Yes, I own the material
							</button>

							<button
								type="button"
								on:click={() => chooseOwnership('no')}
								class:!bg-surface-900={ownershipStatus === 'no'}
								class:!text-white={ownershipStatus === 'no'}
								class:!border-surface-900={ownershipStatus === 'no'}
								class="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-surface-100">
								No, I do not own the material
							</button>
						</div>
					</div>
				{#if !(ownershipStatus === null)}

					<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_560px]">
						<div class="rounded-xl border border-gray-200 bg-surface-50 p-4">
							<div class="mb-4 flex items-start justify-between gap-4">
								<div>
									<h3 class="text-sm font-semibold text-gray-900">
										License selection
									</h3>
									<p class="mt-1 text-sm text-gray-600">
										Ownership status:
										<span class="font-medium text-gray-900">
											{ownershipStatus === 'yes' ? 'You own the material' : 'You do not own the material'}
										</span>
									</p>
								</div>

								<button
									type="button"
									on:click={goBackToOwnershipStep}
									class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-surface-50">
									Back
								</button>
							</div>

							<div class="flex flex-wrap items-center gap-2">
								<button
									type="button"
									on:click={setSuggestedMode}
									class:!bg-surface-900={!customMode}
									class:!text-white={!customMode}
									class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-surface-100">
									Choose predefined license
								</button>

								<button
									type="button"
									on:click={setCustomMode}
									class:!bg-surface-900={customMode}
									class:!text-white={customMode}
									class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-surface-100">
									Enter custom license
								</button>
							</div>

							{#if !customMode}
								<div class="mt-4 space-y-4">
									<label class="block space-y-2">
										<span class="text-sm font-semibold text-gray-900">License</span>

										<div class="relative max-w-md">
											<select
												bind:value={selectedLicenseValue}
												class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-500">
												<option value="" disabled>Select a license</option>
												{#each licenses as item}
													<option value={item.value}>{item.label}</option>
												{/each}
											</select>

											<div class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
												▼
											</div>
										</div>
									</label>

									{#if selectedLicense}
										<div class="rounded-xl border border-gray-200 bg-white p-4">
											<div>
												<h3 class="text-sm font-semibold text-gray-900">
													{selectedLicense.label}
												</h3>
												<p class="mt-1 text-sm text-gray-600">
													{selectedLicense.summary}
												</p>
											</div>

											<p class="mt-3 text-sm text-gray-700">
												{selectedLicense.description}
											</p>

											<div class="mt-4 grid gap-2 text-sm sm:grid-cols-2">
												<div class="flex items-center justify-between rounded-lg border px-3 py-2">
													<span class="text-gray-600">Commercial use</span>
													<span class="font-medium text-gray-900">
														{selectedLicense.allowsCommercial ? 'Yes' : 'No'}
													</span>
												</div>

												<div class="flex items-center justify-between rounded-lg border px-3 py-2">
													<span class="text-gray-600">Derivatives allowed</span>
													<span class="font-medium text-gray-900">
														{selectedLicense.allowsDerivatives ? 'Yes' : 'No'}
													</span>
												</div>

												<div class="flex items-center justify-between rounded-lg border px-3 py-2">
													<span class="text-gray-600">Same license required</span>
													<span class="font-medium text-gray-900">
														{selectedLicense.requiresSameLicense ? 'Yes' : 'No'}
													</span>
												</div>

												<div class="flex items-center justify-between rounded-lg border px-3 py-2">
													<span class="text-gray-600">Author waives rights</span>
													<span class="font-medium text-gray-900">
														{selectedLicense.waivesRights ? 'Yes' : 'No'}
													</span>
												</div>
											</div>
										</div>
									{:else}
										<div class="rounded-xl border border-dashed border-gray-300 bg-white p-4">
											<p class="text-sm text-gray-500">
												Select a license to see what it allows and requires.
											</p>
										</div>
									{/if}
								</div>
							{/if}

							{#if customMode}
								<div class="mt-4 space-y-2">
									<label class="block text-sm font-semibold text-gray-900">
										Custom license text
									</label>
									<input
										type="text"
										bind:value={customLicenseText}
										placeholder="Example: Custom educational use only"
										class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none placeholder:text-gray-400 focus:border-gray-500" />
									<p class="text-xs text-gray-500">
										This value will be returned exactly as entered.
									</p>
								</div>
							{/if}
						</div>

						{#if ownershipReference}
							<aside class="rounded-xl border border-gray-200 bg-white p-4">
								<h3 class="text-sm font-semibold text-gray-900">Reference</h3>

								<div class="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-surface-50 p-2">
									<a
										href={ownershipReference.imageSrc}
										target="_blank"
										rel="noreferrer"
										class="block">
										<img
											src={ownershipReference.imageSrc}
											alt={ownershipReference.imageAlt}
											class="w-full rounded-xl object-contain bg-white" />
									</a>
								</div>
								<p class="mt-3 text-sm text-gray-600">
									(click to enlarge)
								</p>
								{#if ownershipStatus === 'yes'}
									<p class="mt-3 text-sm text-red-600">
										<!-- Creative Commons licenses by Voter CC BY-SA. -->
										 TODO: PUT THE CORRECT LICENSE INFO HERE
									</p>
								{:else}
									<p class="mt-3 text-sm text-red-600">
										 TODO: PUT THE CORRECT LICENSE INFO HERE
									</p>
								{/if}
								<a
									href={ownershipReference.infoHref}
									target="_blank"
									rel="noreferrer"
									class="mt-3 inline-flex text-sm font-medium text-blue-600 hover:underline">
									{ownershipReference.infoLabel}
								</a>
							</aside>
						{/if}
					</div>
				{/if}
			</div>

			<div class="flex items-center justify-between border-t border-surface-200 px-6 py-4 dark:border-surface-700">
				<div class="text-xs text-gray-500">
					Supported licenses: CC BY, CC BY-SA, CC BY-ND, CC BY-NC, CC BY-NC-SA, CC BY-NC-ND, or Custom.
				</div>

				<div class="flex gap-3">
					<button
						type="button"
						on:click={close}
						class="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-surface-50">
						Cancel
					</button>

					<button
						type="button"
						on:click={apply}
						disabled={!canApply}
						class="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50">
						Apply
					</button>
				</div>
			</div>
		</div>
	</div>
</div>