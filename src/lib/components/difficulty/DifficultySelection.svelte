<script lang="ts">
    import { DiffBar } from '$lib';
    import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';

    export let difficulty: '' | 'easy' | 'intermediate' | 'advanced';
</script>


<RadioGroup class="flex gap-1 col-span-3 w-9/12 h-8 items-center px-3 py-0" active="variant-filled-primary"
            hover="hover:variant-soft-primary">
    <RadioItem bind:group={difficulty} name="justify" value={"easy"}>
        <DiffBar diff="easy" />
    </RadioItem>
    <RadioItem bind:group={difficulty} name="justify" value={"intermediate"}>
        <DiffBar diff="medium" />
    </RadioItem>
    <RadioItem bind:group={difficulty} name="justify" value={"advanced"}>
        <DiffBar diff="hard" />
    </RadioItem>
</RadioGroup>