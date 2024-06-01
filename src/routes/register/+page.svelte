<script lang="ts">
	import Icon from '@iconify/svelte';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { goto } from '$app/navigation';

	export let form: ActionData;

	if (form && form.status === 200) {
		goto('/login');
	}

	let email = '';
	let password = '';
	let firstName = '';
	let lastName = '';
	let validationErrors = { email: '', password: '', output: '' };
</script>

<div class="col-span-12 h-[80vh] flex items-center justify-center">
	<form on:submit|preventDefault use:enhance method="POST" action="?/register"
		  class="flex flex-col w-96 border p-8 rounded-lg shadow text-surface-600 gap-2">
		<h3 class="text-center mt-4 text-surface-700 font-semibold text-xl">Register</h3>
		<label for="firstName">
			First Name
			<input class="input rounded-lg bg-white" name="firstName" type="text" bind:value={firstName} />
		</label>
		<label for="lastName">
			Last Name
			<input class="input rounded-lg bg-white" name="lastName" type="text" bind:value={lastName} />
		</label>
		<label for="email">
			Email
			<input class="input rounded-lg bg-white" name="email" type="email" bind:value={email} />
		</label>
		<div class="text-sm px-2 rounded-lg variant-soft-error text-wrap">
			<span>{validationErrors.email}</span>
		</div>
		<label for="password">
			Password
			<input class="input rounded-lg bg-white" name="password" type="password" bind:value={password} />
		</label>
		<div class="text-sm px-2 rounded-lg variant-soft-error text-wrap">
			<span>{validationErrors.password}</span>
		</div>
		<button class="btn rounded-lg mt-4 variant-soft-primary">Register</button>
		<hr class="my-4 text-surface-200">
		<button class="btn rounded-lg bg-surface-800 text-surface-50">
			<Icon icon="mdi:github" class="text-2xl mr-2" />
			Register with GitHub
		</button>
		<p class="text-center text-sm mt-2">Don't have an account? <a class="anchor text-primary-600" href="/register">Create
			one</a></p>
		{#if form && form.status !== 200}
			<div class="text-sm px-2 rounded-lg variant-soft-error text-wrap">
				<span>{form.message}</span>
				{#if form.message === 'Bad input' && form.errors}
					{#each form.errors as error}
						<span>{error.message}</span>
					{/each}
				{/if}
			</div>
		{/if}
	</form>
</div>