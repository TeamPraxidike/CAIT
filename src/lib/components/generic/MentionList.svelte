<script lang="ts">
    import { Avatar } from '@skeletonlabs/skeleton';
    import type { MentionUser } from './tiptapExtensions';

    // Props provided by TipTap's suggestion engine
    export let items: MentionUser[] = [];
    export let command: (item: MentionUser) => void;

    let selectedIndex = 0;

    // Reset selection when items change (e.g., user keeps typing)
    $: if (items) {
        selectedIndex = 0;
    }

    // Called by TipTap to handle keyboard navigation
    export function onKeyDown({ event }: { event: KeyboardEvent }) {
        if (event.key === 'ArrowUp') {
            selectedIndex = (selectedIndex + items.length - 1) % items.length;
            return true;
        }
        if (event.key === 'ArrowDown') {
            selectedIndex = (selectedIndex + 1) % items.length;
            return true;
        }
        if (event.key === 'Enter') {
            const user = items[selectedIndex];
            command({ ...user, label: user.username });
            return true;
        }
        return false;
    }
</script>

<div class="textarea p-0 overflow-hidden shadow-xl w-72 z-50">
    {#if items.length > 0}
        <nav class="list-nav">
            <ul class="divide-y divide-surface-500/10">
                {#each items as user, index}
                    <li>
                        <button
                            type="button"
                            class="w-full text-left px-4 py-3 flex items-center space-x-3 transition-colors
                            {index === selectedIndex ? 'variant-filled-primary' : 'hover:bg-surface-500/10'}"
                            on:click={() => command({ ...user, label: user.username })}
                        >
                            <Avatar
                                src={user.profilePicData}
                                initials="{user.firstName?.[0] ?? ''}{user.lastName?.[0] ?? ''}"
                                width="w-8"
                                background="bg-surface-300 dark:bg-surface-700"
                            />
                            <div class="flex flex-col min-w-0">
                                <span class="text-sm font-bold truncate">
                                    {user.firstName} {user.lastName}
                                </span>
                                <span class="text-xs opacity-60 truncate">
                                    @{user.username}
                                </span>
                            </div>
                        </button>
                    </li>
                {/each}
            </ul>
        </nav>
    {:else}
        <div class="p-4 text-sm opacity-60 text-center italic">
            No users found
        </div>
    {/if}
</div>
