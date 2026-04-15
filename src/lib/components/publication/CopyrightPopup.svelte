<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let open = false;
	export let initialValue = '';
	export let initialCustomLicenseText = '';

	let allowCommercial: boolean | null = null;
	let allowDerivatives: boolean | null = null;
	let requireSameLicense: boolean | null = null;
	let waiveRights: boolean | null = null;

	let suggestedLicense = '';
	let customMode = false;
	let customLicenseText = '';

	const licenseDescriptions: Record<string, string> = {
		'Public Domain': 'No rights reserved where legally possible.',
		'CC BY':
			'Attribution required. Commercial use and adaptations allowed.',
		'CC BY-SA':
			'Attribution required. Adaptations allowed, must use the same license.',
		'CC BY-ND':
			'Attribution required. Commercial use allowed. No derivatives allowed.',
		'CC BY-NC': 'Attribution required. Non-commercial use only.',
		'CC BY-NC-SA':
			'Attribution required. Non-commercial use only. Adaptations must use the same license.',
		'CC BY-NC-ND':
			'Attribution required. Non-commercial use only. No derivatives allowed.',
	};

	function resetState() {
		allowCommercial = null;
		allowDerivatives = null;
		requireSameLicense = null;
		waiveRights = null;
		suggestedLicense = '';
		customMode = false;
		customLicenseText = initialCustomLicenseText || '';
	}

	$: if (open) {
		resetState();
	}

	function close() {
		dispatch('close');
	}

	function apply() {
		const value = customMode ? customLicenseText.trim() : suggestedLicense;

		dispatch('apply', {
			value,
			customLicenseText: customMode ? customLicenseText.trim() : '',
			suggestedLicense: customMode ? 'Custom' : suggestedLicense,
		});
	}

	function setCustomMode() {
		customMode = true;
		if (
			!customLicenseText &&
			initialValue &&
			!licenseDescriptions[initialValue]
		) {
			customLicenseText = initialValue;
		}
	}

	function setSuggestedMode() {
		customMode = false;
	}

	$: canShowSameLicenseQuestion =
		waiveRights === false && allowDerivatives === true;

	$: {
		if (waiveRights === true) {
			suggestedLicense = 'Public Domain';
		} else if (
			waiveRights === false &&
			allowCommercial !== null &&
			allowDerivatives !== null
		) {
			if (
				allowCommercial === true &&
				allowDerivatives === true &&
				requireSameLicense === true
			) {
				suggestedLicense = 'CC BY-SA';
			} else if (
				allowCommercial === true &&
				allowDerivatives === true &&
				requireSameLicense === false
			) {
				suggestedLicense = 'CC BY';
			} else if (allowCommercial === true && allowDerivatives === false) {
				suggestedLicense = 'CC BY-ND';
			} else if (
				allowCommercial === false &&
				allowDerivatives === true &&
				requireSameLicense === true
			) {
				suggestedLicense = 'CC BY-NC-SA';
			} else if (
				allowCommercial === false &&
				allowDerivatives === true &&
				requireSameLicense === false
			) {
				suggestedLicense = 'CC BY-NC';
			} else if (
				allowCommercial === false &&
				allowDerivatives === false
			) {
				suggestedLicense = 'CC BY-NC-ND';
			} else {
				suggestedLicense = '';
			}
		} else {
			suggestedLicense = '';
		}
	}
</script>

<!-- <div
	class="backdrop"
	on:click={close}>
</div>
<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 0.5);
  }
</style> -->

<div class="fixed inset-0 z-[11000] overflow-y-auto bg-black/50">
	<div class="flex min-h-full items-start justify-center p-4 sm:items-center">
		<div
			class="z-[11000] w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-surface-50 dark:bg-surface-800 shadow-2xl">
			<div
				class="flex items-center justify-between border-b border-surface-200 px-6 py-4 dark:border-surface-700">
				<div>
					<h2
						class="text-lg font-semibold text-surface-900 dark:text-surface-100">
						Choose a license
					</h2>
					<p
						class="mt-1 text-sm text-surface-600 dark:text-surface-400">
						Answer a few questions or enter a custom license
						manually.
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

			<div
				class="max-h-[calc(90vh-145px)] overflow-y-auto space-y-6 px-6 py-5">
				<div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
					<div class="flex items-start justify-between gap-4">
						<div>
							<h3 class="text-sm font-semibold text-gray-900">
								Current value
							</h3>
							<p class="mt-1 text-sm text-gray-600">
								{initialValue || 'No license selected'}
							</p>
						</div>

						<button
							type="button"
							on:click={resetState}
							class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
							Reset
						</button>
					</div>
				</div>

				<div class="space-y-5">
					<div class="rounded-xl border border-gray-200 p-4">
						<div class="mb-3 flex items-start gap-3">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg">
								🌍
							</div>
							<div>
								<h3 class="text-sm font-semibold text-gray-900">
									Do you want to place this work in the public
									domain? Not recommended for TU Delft
									documents.
								</h3>
								<p class="mt-1 text-sm text-gray-500">
									Choosing yes suggests Public Domain and
									skips the rest.
								</p>
							</div>
						</div>

						<div class="flex gap-3">
							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
								<input
									type="radio"
									name="waiveRights"
									bind:group={waiveRights}
									value={true} />
								<span class="text-sm">Yes</span>
							</label>

							<label
								class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
								<input
									type="radio"
									name="waiveRights"
									bind:group={waiveRights}
									value={false} />
								<span class="text-sm">No</span>
							</label>
						</div>
					</div>

					{#if waiveRights === false}
						<div class="rounded-xl border border-gray-200 p-4">
							<div class="mb-3 flex items-start gap-3">
								<div
									class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg">
									💼
								</div>
								<div>
									<h3
										class="text-sm font-semibold text-gray-900">
										Allow commercial use?
									</h3>
									<p class="mt-1 text-sm text-gray-500">
										This means others may use the work in
										commercial contexts.
									</p>
								</div>
							</div>

							<div class="flex gap-3">
								<label
									class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
									<input
										type="radio"
										name="allowCommercial"
										bind:group={allowCommercial}
										value={true} />
									<span class="text-sm">Yes</span>
								</label>

								<label
									class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
									<input
										type="radio"
										name="allowCommercial"
										bind:group={allowCommercial}
										value={false} />
									<span class="text-sm">No</span>
								</label>
							</div>
						</div>

						<div class="rounded-xl border border-gray-200 p-4">
							<div class="mb-3 flex items-start gap-3">
								<div
									class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg">
									✏️
								</div>
								<div>
									<h3
										class="text-sm font-semibold text-gray-900">
										Allow derivatives or modifications?
									</h3>
									<p class="mt-1 text-sm text-gray-500">
										This means others may adapt, remix,
										translate, or build on the work.
									</p>
								</div>
							</div>

							<div class="flex gap-3">
								<label
									class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
									<input
										type="radio"
										name="allowDerivatives"
										bind:group={allowDerivatives}
										value={true} />
									<span class="text-sm">Yes</span>
								</label>

								<label
									class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
									<input
										type="radio"
										name="allowDerivatives"
										bind:group={allowDerivatives}
										value={false} />
									<span class="text-sm">No</span>
								</label>
							</div>
						</div>

						{#if canShowSameLicenseQuestion}
							<div class="rounded-xl border border-gray-200 p-4">
								<div class="mb-3 flex items-start gap-3">
									<div
										class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg">
										🔁
									</div>
									<div>
										<h3
											class="text-sm font-semibold text-gray-900">
											Should adaptations use the same
											license?
										</h3>
										<p class="mt-1 text-sm text-gray-500">
											This is the “share alike” option.
										</p>
									</div>
								</div>

								<div class="flex gap-3">
									<label
										class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
										<input
											type="radio"
											name="requireSameLicense"
											bind:group={requireSameLicense}
											value={true} />
										<span class="text-sm">Yes</span>
									</label>

									<label
										class="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
										<input
											type="radio"
											name="requireSameLicense"
											bind:group={requireSameLicense}
											value={false} />
										<span class="text-sm">No</span>
									</label>
								</div>
							</div>
						{/if}
					{/if}
				</div>

				<div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
					<div class="flex flex-wrap items-center gap-2">
						<button
							type="button"
							on:click={setSuggestedMode}
							class:!bg-gray-900={!customMode}
							class:!text-white={!customMode}
							class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100">
							Use suggested license
						</button>

						<button
							type="button"
							on:click={setCustomMode}
							class:!bg-gray-900={customMode}
							class:!text-white={customMode}
							class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100">
							Enter custom license
						</button>
					</div>

					{#if !customMode}
						<div
							class="mt-4 rounded-xl border border-gray-200 bg-white p-4">
							<h3 class="text-sm font-semibold text-gray-900">
								Suggested result
							</h3>

							{#if suggestedLicense}
								<p
									class="mt-2 text-base font-medium text-gray-900">
									{suggestedLicense}
								</p>
								<p class="mt-1 text-sm text-gray-600">
									{licenseDescriptions[suggestedLicense]}
								</p>
							{:else}
								<p class="mt-2 text-sm text-gray-500">
									Answer the questions above to generate a
									suggested license.
								</p>
							{/if}
						</div>
					{/if}

					{#if customMode}
						<div class="mt-4 space-y-2">
							<label
								class="block text-sm font-semibold text-gray-900"
								>Custom license text</label>
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
			</div>

			<div
				class="flex items-center justify-between border-t border-surface-200 px-6 py-4 dark:border-surface-700">
				<div class="text-xs text-gray-500">
					Supported suggestions: Public Domain, CC BY, CC BY-SA, CC
					BY-ND, CC BY-NC, CC BY-NC-SA, CC BY-NC-ND, or Custom.
				</div>

				<div class="flex gap-3">
					<button
						type="button"
						on:click={close}
						class="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
						Cancel
					</button>

					<button
						type="button"
						on:click={apply}
						disabled={!customMode && !suggestedLicense}
						class="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50">
						Apply
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
