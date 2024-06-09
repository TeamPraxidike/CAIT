<script lang="ts">
    import {Autocomplete, type AutocompleteOption, getToastStore, InputChip} from "@skeletonlabs/skeleton";
    import type {Tag} from "@prisma/client";

    let inputChip: InputChip;
    export let allTags: Tag[];
    export let tags: string[] = [];
    $: tags = tags;
    const toastStore = getToastStore();
    let tagInput = '';
    let newTags: string[] = [];

    type TagOption = AutocompleteOption<string, { content: string }>;
    let flavorOptions: TagOption[] = allTags.map(tag => {
        return {
            value: tag.content,
            label: tag.content
        };
    });

    const triggerRepeatInput = (type: string,input: string)=>{
        toastStore.trigger({
            message: `${type} ${input} Already Added`,
            background: 'bg-warning-200'
        });
    }

    const handleInvalid = () => {
        if(tagInput.length>0 && !tags.includes(tagInput)) {
            tags=[...tags,tagInput];
            newTags=[...newTags,tagInput];
            tagInput='';
        }
        else {
            triggerRepeatInput("Tag",tagInput);
        }
    }


    function onInputChipSelect(e: CustomEvent<TagOption>): void {
        console.log('onInputChipSelect', e.detail);
        if (!tags.includes(e.detail.value)) {
            inputChip.addChip(e.detail.value);
            tagInput = '';
        }
    }
</script>

<label class="pl-3" for="tags_input">Tags (at least one)<span class="text-error-300">*</span>:</label>
<div class="text-token space-y-2 pl-3">
    <InputChip bind:this={inputChip} whitelist={allTags.map(t => t.content)}
               bind:input={tagInput} bind:value={tags} name="chips" on:invalid={handleInvalid} class="dark:bg-transparent dark:border-surface-300 dark:text-surface-300 bg-transparent text-surface-800 border-surface-700"/>
    <div class="card w-full max-h-48 p-4 overflow-y-auto" tabindex="-1">
        <Autocomplete bind:input={tagInput} options={flavorOptions} denylist={tags}
                      on:selection={onInputChipSelect} emptyState="No Tags Found. Press Enter to Create New Tag." />
    </div>
</div>