<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { getToastStore } from '@skeletonlabs/skeleton';

	export let loggedUser: { id: string; emailVisibilityPrompted?: boolean } | null;

	const toastStore = getToastStore();

	$: open = !!loggedUser && !loggedUser.emailVisibilityPrompted;

	let selected: string = 'PUBLIC';
	let saving = false;

	const options: { value: string; label: string; description: string }[] = [
		{
			value: 'PUBLIC',
			label: 'Show my email',
			description: 'Let other users see your email and contact you. You can change this later in Settings.',
		},
		{
			value: 'HIDDEN',
			label: "Don't show my email",
			description: 'Keep your email private. You can change this later in Settings.',
		},
	];

	async function save(value: string) {
		if (!loggedUser || saving) return;
		saving = true;

		let saved = false;
		try {
			const res = await fetch(`/api/user/${loggedUser.id}/email-visibility`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ emailVisibility: value }),
			});
			saved = res.ok;
		} catch {
			saved = false;
		}
		saving = false;

		if (saved) {
			open = false;
			invalidate('supabase:auth').catch(() => {});
		} else {
			toastStore.trigger({
				message: 'Could not save your preference, please try again.',
				background: 'bg-error-200',
				classes: 'text-surface-900',
			});
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-[9998] flex items-center justify-center bg-surface-900/50 p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="email-visibility-prompt-title"
	>
		<div class="w-full max-w-lg rounded-lg bg-surface-50 dark:bg-surface-800 p-6 shadow-xl flex flex-col gap-5">
			<div class="flex flex-col gap-2">
				<h2 id="email-visibility-prompt-title" class="text-xl text-surface-900 dark:text-surface-50">
					Display your email address?
				</h2>
				<p class="text-sm text-surface-600 dark:text-surface-300">
					Would you like to show your email address on your profile so other users can contact you
					about your materials, courses and circuits? You can change this any time in your Settings.
				</p>
			</div>

			<div class="flex flex-col gap-3">
				{#each options as option}
					<label
						class="flex gap-3 items-start p-3 rounded-lg border cursor-pointer
							   border-surface-300 dark:border-surface-600
							   hover:border-primary-400
							   {selected === option.value ? 'border-primary-500 ring-1 ring-primary-500' : ''}"
					>
						<input type="radio" class="radio mt-1" value={option.value} bind:group={selected} />
						<span class="flex flex-col">
							<span class="text-surface-900 dark:text-surface-50">{option.label}</span>
							<span class="text-sm text-surface-600 dark:text-surface-300">{option.description}</span>
						</span>
					</label>
				{/each}
			</div>

			<div class="flex justify-end gap-3">
				<button
					type="button"
					class="btn variant-filled-primary"
					disabled={saving}
					on:click={() => save(selected)}
				>
					Save
				</button>
			</div>
		</div>
	</div>
{/if}
