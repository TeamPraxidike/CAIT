<script lang="ts">
import {DiffBar} from "$lib";
import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
export let difficulty: ""|"easy"|"intermediate"|"advanced";
</script>


<RadioGroup class="flex justify-between col-span-3 dark:bg-transparent"  active="variant-filled-primary" hover="hover:variant-soft-primary">
    <RadioItem bind:group={difficulty} name="justify" value={"easy"}>
       <div>
           <DiffBar diff="easy"/>
       </div>
    </RadioItem>
    <RadioItem bind:group={difficulty} name="justify" value={"intermediate"}>
        <div>
            <DiffBar diff="medium"/>
        </div>
    </RadioItem>
    <RadioItem bind:group={difficulty} name="justify" value={"advanced"}>
        <div>
            <DiffBar diff="hard"/>
        </div>
    </RadioItem>
</RadioGroup>
