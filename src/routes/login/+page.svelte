<script lang="ts">
	import {signIn} from '@auth/sveltekit/client';
	import Icon from '@iconify/svelte';
	import { signInSchema } from '$lib/util/zod';

	let email = ""
	let password = ""
	let validationErrors = { email: '', password: '', output: '' }


	async function handleSignIn(e: Event) {
		e.preventDefault();

		const { success, error } = signInSchema.safeParse({ email, password });

		if (!success) {
			// Handle validation error
			validationErrors.email = error.formErrors.fieldErrors.email?.join(', ') || '';
			validationErrors.password = error.formErrors.fieldErrors.password?.join(', ') || '';
			return;
		}

		try {
			await signIn('credentials', { email, password, firstName: 'John', lastName: 'Doe'});
		} catch (error) {
			console.error(error);
		}
	}
</script>

<div class="col-span-12 h-[80vh] flex items-center justify-center">
	<form class="flex flex-col w-96 border p-8 rounded-lg shadow text-surface-600 gap-2">
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
		<button class="btn rounded-lg mt-4 variant-soft-primary" on:click={handleSignIn}>Log in</button>
		<hr class="my-4 text-surface-200">
		<button class="btn rounded-lg bg-surface-800 text-surface-50" on:click={handleSignIn}>
			<Icon icon="mdi:github" class="text-2xl mr-2" />
			Log in with GitHub
		</button>
		<p class="text-center text-sm mt-2">Don't have an account? <a class="anchor text-primary-600" href="/register">Create one</a></p>

	</form>
</div>