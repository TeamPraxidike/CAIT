<script lang="ts">
    import Icon from "@iconify/svelte";

    export let icon: string;
    export let href: string;
    export let link: string;
    export let p: string = "p-1";
</script>

<a {href} class="btn flex gap-2 items-center justify-start hover:bg-surface-100 rounded-lg {p}
                 dark:hover:bg-surface-700">
    <Icon {icon} className="text-surface-500 dark:text-surface-100"/>
    <span class="text-surface-800 dark:text-surface-100">{link}</span>
</a>