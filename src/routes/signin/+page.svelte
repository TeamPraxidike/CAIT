<script lang="ts">
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	export let form;

	let toastStore = getToastStore();
	let email = form?.email || '';
	let password = '';

	let emailPasswordLogin: boolean = false;

	let validationErrors = { email: '', password: '', output: '' };

	$: if (form?.status === 200) {
		toastStore.trigger({
			message: 'Registration successful',
			background: 'bg-success-200',
			classes: 'text-surface-900',
		});
		goto('/browse');
	} else if(form && form.status !== 200){
		toastStore.trigger({
			message: `Login fail ${form.error}`,
			background: 'bg-error-200',
			classes: 'text-surface-900',
		});
	}

	const handleInputEnter = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			event.preventDefault();
		}
	};
</script>

<div class="col-span-12 h-[80vh] flex items-center justify-center">
	<form action="?/login" method="POST" use:enhance = {async ({ formData }) => {
		formData.append('emailPasswordLogin', JSON.stringify(emailPasswordLogin));
		}}
		  class="flex flex-col w-96 border p-8 rounded-lg shadow text-surface-600 gap-2 justify-center">
		<h3 class="text-center mt-4 text-surface-700 font-semibold text-xl">Login</h3>
		{#if !emailPasswordLogin}
			<button class="btn rounded-lg mt-4 variant-soft-primary" type="button" on:click={() => emailPasswordLogin = true}>Email & Password</button>
			<button class="btn rounded-lg mt-4 variant-soft-primary" type="submit">SSO</button>
		{:else}
			<label for="email">
				Email
				<input class="input rounded-lg bg-white" name="email" type="email" bind:value={email}
					   on:keypress={handleInputEnter} />
			</label>
			<div class="text-sm px-2 rounded-lg variant-soft-error text-wrap">
				<span>{validationErrors.email}</span>
			</div>
			<label for="password">
				Password
				<input class="input rounded-lg bg-white" name="password" type="password" bind:value={password}
					   on:keypress={handleInputEnter} />
			</label>
			<div class="text-sm px-2 rounded-lg variant-soft-error text-wrap">
				<span>{validationErrors.password}</span>
			</div>
			<button class="btn rounded-lg mt-4 variant-soft-primary" type="submit">Login</button>
			<button class="btn rounded-lg mt-4" type="button" on:click={() => emailPasswordLogin = false}>Go Back</button>
			<hr class="my-4 text-surface-200">
			<p class="text-center text-sm mt-2">Don't have an account? <a class="anchor text-primary-600" href="/register">Create
				one</a></p>
			<div class="text-sm px-2 rounded-lg variant-soft-error text-wrap">
				{#if form?.incorrect}
					<p>Error logging in: {form.error}</p>
				{/if}
			</div>
		{/if}
	</form>
</div>