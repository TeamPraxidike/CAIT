<script lang="ts">
    import {authStore, UserProp} from "$lib";
    import Icon from "@iconify/svelte";
    import type {User} from "@prisma/client";
    import { fly } from 'svelte/transition';

    let userName:HTMLInputElement;
    export let users: User[] = [];
    let additionalMaintainers: User[] = [];
    let searchableUsers = users;
    let display = 'hidden';
    let uid = $authStore.user?.id || 0;

    const handleRemoveMaintainer = (index: number) => {
        const user = additionalMaintainers.filter((_,i)=> i===index)[0];
        additionalMaintainers = additionalMaintainers.filter((_,i)=>i !== index);
        searchableUsers = [...searchableUsers,user];
    }

    $: additionalMaintainers = additionalMaintainers
    $: searchableUsers = searchableUsers

    const addMaintainer = (user: User) =>{
        if(!additionalMaintainers.map(x=>x.id).includes(user.id)){
            additionalMaintainers = [...additionalMaintainers,user];
            searchableUsers = users.filter(x=> !additionalMaintainers.map(y=>y.id).includes(x.id));
            searchableUsers = searchableUsers.filter(x=>x.id!==user.id);
            userName.value = '';
            display='hidden';
        }
    }

    const handleSearchUsers = () =>{
        let text = userName.value.toLowerCase() ?? '';
        if (text === ''){
            searchableUsers = users.filter(x=> !additionalMaintainers.map(y=>y.id).includes(x.id));
        }
        else{
            searchableUsers = users.filter(x=> !additionalMaintainers.map(y=>y.id).includes(x.id));
            searchableUsers = searchableUsers.filter(x=>`${x.firstName} ${x.lastName}`.toLowerCase().includes(text ?? ''));
        }
    }

    function clickOutside(node: HTMLElement): { destroy: () => void } {
        const handleClick = (event: MouseEvent) => {
            if (!node.contains(event.target as Node)) {
                if(display === "flex"){
                    display = 'hidden'
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
</script>

<div class="flex flex-col gap-2 w-full">
    <span>Maintainers<span class="text-error-300">*</span>:</span>
    <div class="flex flex-wrap my-2 gap-1 items-center w-full">
        {#if $authStore.user}
            <UserProp
                    user={$authStore.user} view="publish" role="Publisher" userPhotoUrl="/fdr.jpg" />
        {/if}

        {#each additionalMaintainers as maintainer, key}
            <UserProp on:removeMaintainer={()=>handleRemoveMaintainer(key)} user={maintainer} view="publish" role="Maintainer" userPhotoUrl="/fdr.jpg" />
        {/each}

        <button on:click={()=>{display='flex'}} type="button" name="add_maintainer" inputmode="decimal"
                class="rounded-lg hover:bg-opacity-85 text-center">
            <Icon icon="mdi:plus-circle" width="32" height="32"  class="bg-surface-0 text-surface-800 hover:text-surface-600" />
        </button>

        <div transition:fly={{ x: -8, duration: 300 }} use:clickOutside class="{display} flex-col overflow-y-auto max-h-full border rounded-lg dark:bg-surface-700" >
            <input on:input={handleSearchUsers} bind:this={userName} placeholder="Search for user" class="dark:text-surface-50 dark:bg-surface-600 text-surface-800 border-none rounded-lg focus:ring-0 text-sm"/>
            {#each searchableUsers as user}
                {#if user.id !== uid}
                    <button type="button" class="dark:hover:text-surface-600  hover:bg-primary-100 text-start p-0.5 px-3" on:click={()=>{addMaintainer(user)}}>
                        {user.firstName} {user.lastName}
                    </button>
                {/if}
            {/each}
        </div>
    </div>
</div>