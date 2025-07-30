<script lang="ts">
	import { UserProp } from '$lib';
	import Icon from '@iconify/svelte';
	import type { User } from '@prisma/client';
	import { page } from '$app/stores';
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';

	let userName: HTMLInputElement;
	export let users: UserWithProfilePic[] = [];
	export let additionalMaintainers: UserWithProfilePic[] = [];
	export let searchableUsers = users;
	let display = 'hidden';
	let uid = $page.data.session?.user.id || 0;
	type UserWithProfilePic = User & { profilePicData: string | null};
	export let publisher: UserWithProfilePic
	
	// todo: ask bobby and remove if unnecessary.
	// note: I am Bobi, I was not asked but it is ok
	// let p = $page.data.session?.user as User & {profilePic: string};
	// let publisher = {
	// 	id: p.id,
	// 	firstName: p.firstName,
	// 	lastName: p.lastName,
	// 	username: p.username,
	// 	email: p.email,
	// 	emailVerified: p.emailVerified,
	// 	reputation: p.reputation,
	// 	password: p.password,
	// 	isAdmin: p.isAdmin,
	// 	createdAt: p.createdAt,
	// 	updatedAt: p.updatedAt,
	// 	aboutMe: p.aboutMe,
	// }

	const handleRemoveMaintainer = (index: number) => {
		const user = additionalMaintainers.filter((_, i) => i === index)[0];
		additionalMaintainers = additionalMaintainers.filter((_, i) => i !== index);
		searchableUsers = [...searchableUsers, user];
	};

	$: additionalMaintainers = additionalMaintainers;
	$: searchableUsers = searchableUsers;

	const addMaintainer = (user: UserWithProfilePic) => {
		if (!additionalMaintainers.map(x => x.id).includes(user.id)) {
			additionalMaintainers = [...additionalMaintainers, user];
			searchableUsers = users.filter(x => !additionalMaintainers.map(y => y.id).includes(x.id));
			searchableUsers = searchableUsers.filter(x => x.id !== user.id);
			userName.value = '';
			display = 'hidden';
		}
	};

	const handleSearchUsers = () => {
		let text = userName.value.toLowerCase() ?? '';
		if (text === '') {
			searchableUsers = users.filter(x => !additionalMaintainers.map(y => y.id).includes(x.id));
		} else {
			searchableUsers = users.filter(x => !additionalMaintainers.map(y => y.id).includes(x.id));
			searchableUsers = searchableUsers.filter(x => `${x.firstName} ${x.lastName}`.toLowerCase().includes(text ?? ''));
		}
	};

	function clickOutside(node: HTMLElement): { destroy: () => void } {
		const handleClick = (event: MouseEvent) => {
			if (!node.contains(event.target as Node)) {
				if (display === 'flex') {
					display = 'hidden';
				}
			}
		};

		document.addEventListener('click', handleClick, true);


		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}
	const popupAdd: PopupSettings = {
		event: 'click',
		target: 'hoverAdd',
		placement: 'right',
		middleware: {
			offset: 2
		},
		closeQuery: '#user'
	};
</script>

<div class="flex flex-col gap-2 w-full p-3">
	<span>Maintainers<span class="text-error-300">*</span>:</span>
	<div class="flex flex-wrap flex-grow-0 my-2 gap-1 items-center w-full">
		<UserProp role="Publisher" view="publish" user={publisher} userPhotoUrl={publisher.profilePicData}/>
		{#each additionalMaintainers as maintainer, key (maintainer.id)}
			<UserProp on:removeMaintainer={()=>handleRemoveMaintainer(key)} user={maintainer} view="publish"
								role="Maintainer" userPhotoUrl={maintainer.profilePicData} />
		{/each}

		<button type="button" name="add_maintainer" use:popup={popupAdd} class="btn rounded-lg hover:bg-opacity-85 text-center" >
			<Icon icon="mdi:plus-circle" width="32" height="32"
						class="bg-surface-0 text-surface-800 hover:text-surface-600" />
		</button>

	</div>
</div>

<div data-popup="hoverAdd" use:clickOutside
		 class="hidden flex-col overflow-y-auto max-h-48 border rounded-lg dark:bg-surface-700 bg-surface-50 z-[9999]">
	<input on:input={handleSearchUsers} bind:this={userName} placeholder="Search for user"
				 class="dark:text-surface-50 dark:bg-surface-600 text-surface-800 border-none rounded-lg focus:ring-0 text-sm" />
	{#each searchableUsers as user}
		{#if user.id !== uid}
			<button type="button" id="user"
							class="btn rounded-none dark:hover:text-surface-600 hover:bg-primary-100 p-0.5 flex flex-items items-center w-full"
							on:click={()=>{addMaintainer(user)}}>
				<!--						<enhanced:img class="rounded-full w-8 h-8" src={'data:image;base64,' + user.profilePicData} alt='user profile pic' />-->
				<span class="w-full h-full">{user.firstName} {user.lastName}</span>

			</button>
		{/if}
	{/each}
</div>
