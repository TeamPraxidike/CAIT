<script lang="ts">
import {EasyDiff, MedDiff, HardDiff} from "$lib";
import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
export let difficulty: string;
</script>


<RadioGroup display="flex" active="variant-filled-primary" hover="hover:variant-soft-primary">
    <RadioItem bind:group={difficulty} name="justify" value={"easy"}>
       <div>
           <EasyDiff/>
       </div>
    </RadioItem>
    <RadioItem bind:group={difficulty} name="justify" value={"intermediate"}>
        <div>
            <MedDiff/>
        </div>
    </RadioItem>
    <RadioItem bind:group={difficulty} name="justify" value={"advanced"}>
        <div>
            <HardDiff/>
        </div>
    </RadioItem>
</RadioGroup>
