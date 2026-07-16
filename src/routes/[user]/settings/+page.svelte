<script lang="ts">
	import { Meta } from '$lib';
	import type { LayoutData } from '../$types';
	import type { ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { invalidate } from '$app/navigation';

	export let data: LayoutData;
	export let form: ActionData;

	const toastStore = getToastStore();

	let selected: string = data.user.emailVisibility ?? 'PUBLIC';

	const options: { value: string; label: string; description: string }[] = [
		{
			value: 'PUBLIC',
			label: 'Visible',
			description: 'Other users can see your email and contact you about your materials, courses and circuits.',
		},
		{
			value: 'HIDDEN',
			label: 'Hidden',
			description: 'Your email is not shown to anyone. Other users will not be able to contact you by email.',
		},
	];

	$: if (form?.success) {
		toastStore.trigger({
			message: 'Email visibility updated.',
			background: 'bg-success-200',
			classes: 'text-surface-900',
		});
	} else if (form && !form.success) {
		toastStore.trigger({
			message: 'Could not update email visibility, please try again.',
			background: 'bg-error-200',
			classes: 'text-surface-900',
		});
	}
</script>

<Meta title="Settings" description="CAIT" type="site" />

<div class="col-span-6 flex flex-col gap-8 mt-8">
	<h3 class="text-xl text-surface-900 text-center dark:text-surface-50">Settings</h3>

	<form
		method="POST"
		action="?/saveEmailVisibility"
		class="flex flex-col gap-6"
		use:enhance={() => {
			return async ({ update }) => {
				await update({ reset: false });
				invalidate('supabase:auth').catch(() => {});
			};
		}}
	>
		<div class="flex flex-col gap-2">
			<h4 class="text-lg text-surface-900 dark:text-surface-50">Email visibility</h4>
			<p class="text-sm text-surface-600 dark:text-surface-300">
				Choose who can see your email address on your profile and on the materials, courses and circuits you publish.
			</p>
		</div>

		<div class="flex flex-col gap-3">
			{#each options as option}
				<label
					class="flex gap-3 items-start p-4 rounded-lg border cursor-pointer
						   border-surface-300 dark:border-surface-600
						   hover:border-primary-400 dark:hover:border-primary-400
						   {selected === option.value ? 'border-primary-500 ring-1 ring-primary-500' : ''}"
				>
					<input
						type="radio"
						name="emailVisibility"
						class="radio mt-1"
						value={option.value}
						bind:group={selected}
					/>
					<span class="flex flex-col">
						<span class="text-surface-900 dark:text-surface-50">{option.label}</span>
						<span class="text-sm text-surface-600 dark:text-surface-300">{option.description}</span>
					</span>
				</label>
			{/each}
		</div>

		<button type="submit" class="btn variant-filled-primary self-start">Save</button>
	</form>
</div>
