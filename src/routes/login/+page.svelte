<script lang="ts">
	import {signIn} from '@auth/sveltekit/client';

	let email = ""
	let password = ""

	async function handleSignIn(e: Event) {
		e.preventDefault();
		try {
			await signIn('credentials', { email, password, firstName: 'John', lastName: 'Doe'});
		} catch (error) {
			console.error(error);
		}
	}
</script>

<div>
	<form>
		<label>
			Email
			<input name="email" type="email" bind:value={email} />
		</label>
		<label>
			Password
			<input name="password" type="password" bind:value={password} />
		</label>
		<button on:click={handleSignIn}>Log in</button>
	</form>
</div>