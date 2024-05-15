<script lang="ts">
    export let diff: 'hard' | 'medium' | 'easy';

    let colour: string;
    switch (diff) {
        case 'hard':
            colour = 'bg-error-400';
            break;
        case 'easy':
            colour = 'bg-green-500';
            break;
        case 'medium':
            colour = 'bg-amber-400';
            break;
    }
</script>

<div class="flex items-end justify-between space-x-0.5 w-4 h-4 md:w-5 md:h-5">
    <div
      class="flex-auto border dark:border-surface-50 border-surface-900  dark:border-opacity-60 border-opacity-60 {colour} h-1/2 rounded-lg"></div>
    <div
      class="flex-auto border dark:border-surface-50 border-surface-900 dark:border-opacity-60 border-opacity-60 {diff === 'hard' || diff==='medium' ? colour : 'bg-none'} h-3/4 rounded-lg"></div>
    <div
      class="flex-auto border dark:border-surface-50 border-surface-900 {diff === 'hard' ? colour : 'bg-none'} dark:border-opacity-60 border-opacity-60 h-full rounded-lg"></div>
</div>