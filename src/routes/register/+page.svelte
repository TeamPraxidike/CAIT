<script lang="ts">
	import Icon from '@iconify/svelte';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { goto } from '$app/navigation';
	import { SignIn } from "@auth/sveltekit/components"
	import { getToastStore } from '@skeletonlabs/skeleton';

	export let form: ActionData;

	const toastStore = getToastStore();

	$: if (form?.status === 200) {
		toastStore.trigger({
			message: 'Registration successful',
			background: 'bg-success-200',
			classes: 'text-surface-900',
		});
		goto('/signin');
	} else if(form && form?.status !== 200){
		toastStore.trigger({
			message: `Registration failed: ${form?.message}`,
			background: 'bg-error-200',
			classes: 'text-surface-900',
		});
	}

	let email = '';
	let password = '';
	let firstName = '';
	let lastName = '';
	let validationErrors = { email: '', password: '', output: '' };

	const handleInputEnter = (event: KeyboardEvent) => {
		if (event.key==='Enter'){
			event.preventDefault();
		}
	}
</script>

<div class="col-span-12 h-[80vh] flex items-center justify-center">
	<form on:submit|preventDefault use:enhance method="POST" action="?/register"
		  class="flex flex-col w-96 border p-8 rounded-lg shadow text-surface-600 gap-2">
		<h3 class="text-center mt-4 text-surface-700 font-semibold text-xl">Register</h3>
		<label for="firstName">
			First Name
			<input class="input rounded-lg bg-white" name="firstName" type="text" bind:value={firstName} on:keypress={handleInputEnter}/>
		</label>
		<label for="lastName">
			Last Name
			<input class="input rounded-lg bg-white" name="lastName" type="text" bind:value={lastName} on:keypress={handleInputEnter}/>
		</label>
		<label for="email">
			Email
			<input class="input rounded-lg bg-white" name="email" type="email" bind:value={email} on:keypress={handleInputEnter}/>
		</label>
		<div class="text-sm px-2 rounded-lg variant-soft-error text-wrap">
			<span>{validationErrors.email}</span>
		</div>
		<label for="password">
			Password
			<input minlength="8" maxlength="32" class="input rounded-lg bg-white" name="password" type="password" bind:value={password} on:keypress={handleInputEnter}/>
		</label>
		<div class="text-sm px-2 rounded-lg variant-soft-error text-wrap">
			<span>{validationErrors.password}</span>
		</div>
		<button class="btn rounded-lg mt-4 variant-soft-primary">Register</button>
		<hr class="my-4 text-surface-200">
		<SignIn provider="github" signInPage="signin">
			<button slot="submitButton" class="btn rounded-lg bg-surface-800 text-surface-50">
				<Icon icon="mdi:github" class="text-2xl mr-2" />
				Register with GitHub
			</button>
		</SignIn>
		<p class="text-center text-sm mt-2">Already have an account? <a class="anchor text-primary-600" href="/signin">Login</a></p>
		<!--{#if form && form.status !== 200}-->
		<!--	<div class="text-sm px-2 rounded-lg variant-soft-error text-wrap">-->
		<!--		<span>{form.message}</span>-->
		<!--	</div>-->
		<!--{/if}-->
	</form>
</div>