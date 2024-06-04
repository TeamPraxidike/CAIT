<script lang="ts">
    import { DiffBar } from '$lib';
    import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
    import type { Difficulty } from '@prisma/client';

    export let difficulty: Difficulty;
</script>

<div class="flex flex-col gap-2">
    <label for="difficulty">Select a difficulty</label>
    <RadioGroup class="rounded-lg h-8 items-center" background="" border="white" active="variant-soft-primary"
                hover="hover:variant-soft-surface">
        <RadioItem bind:group={difficulty} name="justify" value={"easy"}>
            <DiffBar diff="easy" />
        </RadioItem>
        <RadioItem bind:group={difficulty} name="justify" value={"medium"}>
            <DiffBar diff="medium" />
        </RadioItem>
        <RadioItem bind:group={difficulty} name="justify" value={"hard"}>
            <DiffBar diff="hard" />
        </RadioItem>
    </RadioGroup>
</div>

