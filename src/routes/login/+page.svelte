<script lang="ts">
	import Icon from '@iconify/svelte';
	import { signIn } from '@auth/sveltekit/client';
	import { writable } from 'svelte/store';

	let email = ""
	let password = ""
	let validationErrors = { email: '', password: '', output: '' }
	let errorMessage = writable("");


	async function handleSignIn() {
		try {
			const result = await signIn('credentials', { email, password });
			if (!result?.ok) {
				throw new Error(result?.statusText || 'Failed to sign in');
			}
			// Handle successful sign-in (e.g., redirect to dashboard)
		} catch (error:any) {
			errorMessage.set("Failed to sign in: " + error.message);
		}
	}
</script>

<div class="col-span-12 h-[80vh] flex items-center justify-center">
	<form on:submit|preventDefault={handleSignIn} method="POST" class="flex flex-col w-96 border p-8 rounded-lg shadow text-surface-600 gap-2">
		<h3 class="text-center mt-4 text-surface-700 font-semibold text-xl">Login</h3>
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
		<button class="btn rounded-lg mt-4 variant-soft-primary" type="submit">Log in</button>
		<hr class="my-4 text-surface-200">
		<button class="btn rounded-lg bg-surface-800 text-surface-50" on:click={handleSignIn}>
			<Icon icon="mdi:github" class="text-2xl mr-2" />
			Log in with GitHub
		</button>
		<p class="text-center text-sm mt-2">Don't have an account? <a class="anchor text-primary-600" href="/register">Create one</a></p>
		<div class="text-sm px-2 rounded-lg variant-soft-error text-wrap">
			<span>{$errorMessage}</span>
		</div>
	</form>
</div>