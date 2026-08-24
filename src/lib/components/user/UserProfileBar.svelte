<script lang="ts">
    import { page } from '$app/state';
    import type { TUserWithPostsAndProfilePic } from '$lib/database/user';
	import ContactUser from './ContactUser.svelte';
	import { formatMemberSince } from '$lib/util/date';
	import { getModalStore, getToastStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import { goto, invalidateAll } from '$app/navigation';
	type UserRoleValue = 'USER' | 'MODERATOR' | 'ADMIN';

    export let user:TUserWithPostsAndProfilePic;
    if (!user) {
        throw new Error("There was an error with exporting the user data. Please try again.");
    }
	const deletionTarget = user;

    export let userPhotoUrl: string | null;
    export let tabset: number;
    export let memberSince: Date | undefined = undefined;

    const numPosts = user.posts.filter((x) => !x.isDraft).length
    const numDrafts = user.posts.filter((x) => x.isDraft).length
	const availableRoles: UserRoleValue[] = ['USER', 'MODERATOR', 'ADMIN'];
	let selectedRole: UserRoleValue = user.role;
	let roleUpdatePending = false;

    /**
     * Check if the current user is the same as the user being viewed.
     */
    const currentlyAuth = () => page.data.session?.user.id === user.id;
	const canDeleteUser = () => {
		if (currentlyAuth()) return true;
		const viewer = page.data.loggedUser;
		if (viewer?.isAdmin === true || viewer?.role === 'ADMIN') return true;
		const targetIsPrivileged = deletionTarget.isAdmin === true ||
			deletionTarget.role === 'MODERATOR' ||
			deletionTarget.role === 'ADMIN';
		return viewer?.role === 'MODERATOR' && !targetIsPrivileged;
	};
	const modalStore = getModalStore();
	const toastStore = getToastStore();
	$: canManageRoles = page.data.loggedUser?.isAdmin === true || page.data.loggedUser?.role === 'ADMIN';

	async function updateRole() {
		roleUpdatePending = true;
		try {
			const response = await fetch(`/api/user/${deletionTarget.id}/role`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ role: selectedRole }),
			});
			if (!response.ok) {
				const body = await response.json().catch(() => ({}));
				throw new Error(body.error ?? `Failed to update role: ${response.status}`);
			}
			await invalidateAll();
		} catch (error) {
			toastStore.trigger({
				message: error instanceof Error ? error.message : 'Failed to update role',
				background: 'bg-error-200',
			});
			selectedRole = deletionTarget?.role ?? 'USER';
		} finally {
			roleUpdatePending = false;
		}
	}

	async function deleteUser() {
		const response = await fetch(`/api/user/${deletionTarget.id}`, { method: 'DELETE' });
		if (!response.ok) {
			throw new Error(`Failed to delete user: ${response.status}`);
		}

		if (currentlyAuth()) {
			await page.data.supabase.auth.signOut();
		}
		await goto('/browse?type=people');
	}

	function confirmUserDeletion() {
		const modal: ModalSettings = {
			type: 'confirm',
			title: currentlyAuth() ? 'Delete account' : 'Delete user',
			body: `Permanently delete ${deletionTarget.firstName} ${deletionTarget.lastName} and their publications?`,
			response: async (confirmed: boolean) => {
				if (confirmed) await deleteUser();
			},
		};
		modalStore.trigger(modal);
	}

    const defaultProfilePicturePath = "/defaultProfilePic/profile.jpg"
</script>

<div class="col-span-4 flex flex-col items-center gap-2 text-surface-800 rounded-b-lg pb-4 border border-surface-300 border-t-0 self-start
            sm:col-span-4 sm:flex-row sm:px-8 sm:flex-wrap
            md:col-span-8 md:py-8
            lg:col-span-12 lg:px-4
            xl:col-span-3
            dark:bg-surface-800 dark:text-surface-50 dark:border-none">
    <!--{#if userPhotoUrl !== ''}-->
    <!--    <img src={userPhotoUrl} alt="User Profile" class="w-32 h-32 md:w-40 my-4 md:h-40 rounded-full object-cover" />-->
    <!--{:else}-->
    <!--    <div class="w-20 h-20 md:w-40 md:h-40 rounded-full bg-surface-500 placeholder-circle" />-->
    <!--{/if}-->
    <img src={userPhotoUrl ? userPhotoUrl : defaultProfilePicturePath } alt="Profile picture of ${user.username}"
         class="w-32 h-32 md:w-40 my-4 md:h-40 rounded-full object-cover"/>
    <div class="flex px-2 justify-center gap-x-4 gap-y-2 flex-wrap items-center
                sm:flex-col sm:items-start
                md:w-7/12 md:justify-start
                xl:w-full">
        <h2 class="text-lg md:text-xl">{user.firstName} {user.lastName}</h2>

        <div class="hidden md:flex items-start flex-col gap-4 text-surface-700 dark:text-surface-200 ">
            {#if user.email}
                <p class="lg:text-sm 2xl:text-base">Email: {user.email}</p>
            {/if}
            {#if memberSince}
                <p class="lg:text-sm 2xl:text-base text-surface-500 dark:text-surface-400">Member since {formatMemberSince(memberSince)}</p>
            {/if}
            <hr class="w-11/12">

            {#if user.aboutMe !== ''}
                <p class="text-surface-700 text-sm dark:text-surface-400">
                    {user.aboutMe}
                </p>
            {/if}
            <div class="flex gap-2">
                {#if numPosts !== 0}
                    <button class="variant-soft-primary hidden md:block p-2 rounded-lg"
                    on:click={() => tabset = 0}>{numPosts} {numPosts > 1 ? "Publications" : "Publication"}</button>
                {/if}
                {#if currentlyAuth() && numDrafts !== 0}
                    <button class="variant-soft-primary hidden md:block p-2 rounded-lg"
                    on:click={() => tabset=2}>{numDrafts} {numDrafts > 1 ? "Drafts" : "Draft"}</button>
                {/if}
            </div>

            <div class="flex gap-2 flex-wrap">
                {#if currentlyAuth()}
                    <div class="flex gap-2">
                        <a type="button" href="/{user.username}/edit"  class="btn bg-surface-800 text-surface-50 rounded-lg
                           dark:bg-surface-700">Edit Profile</a>
                        <a type="button" href="/{user.username}/settings" class="btn bg-surface-800 text-surface-50 rounded-lg
                           dark:bg-surface-700">Settings</a>
                    </div>
                {/if}
				{#if canDeleteUser()}
					<button type="button" class="btn bg-error-500 text-white rounded-lg" on:click={confirmUserDeletion}>
						{currentlyAuth() ? 'Delete Account' : 'Delete User'}
					</button>
				{/if}
            </div>
            <div class="flex gap-2 flex-wrap">
                

				    <ContactUser target_user={user}  style="btn bg-surface-800 text-surface-50 rounded-lg
                           dark:bg-surface-700"/>
            </div>
            <hr class="w-11/12">

<!--            <div class="flex gap-2 flex-wrap">-->
<!--                {#if currentlyAuth()}-->
<!--                    {#each courses as course}-->
<!--                    <div class="px-4 py-2 rounded-full border border-gray-300 text-sm font-medium-->
<!--					   hover:bg-gray-100 hover:text-black transition">-->
<!--                        {course}-->
<!--                    </div>-->
<!--                        {/each}-->
<!--                    <button class="px-4 py-2 rounded-full border border-gray-300 text-sm font-medium-->
<!--					   hover:bg-gray-100 hover:text-black transition" on:click={openModal}>-->
<!--                        Add Course-->
<!--                    </button>-->
<!--                {/if}-->
<!--            </div>-->
        </div>
    </div>
    <hr class="w-full my-2 md:w-0">

    <!--  VISIBLE ON PHONES   -->
    <div class="px-4 w-full dark:text-surface-200 flex flex-col items-stretch gap-4
                md:hidden">
        {#if user.email}
            <p>Email: {user.email}</p>
        {/if}
        {#if memberSince}
            <p class="text-sm text-surface-500 dark:text-surface-400">Member since {formatMemberSince(memberSince)}</p>
        {/if}
        <p class="text-surface-700 dark:text-surface-400">
            {user.aboutMe}
        </p>
        {#if currentlyAuth()}
            <div class="flex gap-4">
                <a type="button" href="./edit" class="btn bg-surface-800 text-surface-50 rounded-lg
                               dark:bg-surface-700">Edit Profile</a>
                <a type="button" href="./settings" class="btn bg-surface-800 text-surface-50 rounded-lg
                               dark:bg-surface-700">Settings</a>
            </div>
        {/if}
		{#if canDeleteUser()}
			<button type="button" class="btn bg-error-500 text-white rounded-lg" on:click={confirmUserDeletion}>
				{currentlyAuth() ? 'Delete Account' : 'Delete User'}
			</button>
		{/if}
    </div>

	{#if canManageRoles}
		<div class="flex w-full items-end gap-2 px-4">
			<label class="label flex-1" for="user-role">
				<span>Role</span>
				<select id="user-role" class="select" bind:value={selectedRole}>
					{#each availableRoles as role}
						<option value={role}>{role.toLowerCase()}</option>
					{/each}
				</select>
			</label>
			<button type="button" class="btn variant-filled-primary" disabled={roleUpdatePending || selectedRole === user.role} on:click={updateRole}>
				{roleUpdatePending ? 'Saving…' : 'Save role'}
			</button>
		</div>
	{/if}

    <div class="flex gap-2">

    </div>
</div>
