<script lang="ts">
    import {Autocomplete, type AutocompleteOption, getToastStore, InputChip} from "@skeletonlabs/skeleton";
    import type {Tag} from "@prisma/client";

    let inputChip: InputChip;
    export let allTags: Tag[];
    export let tags: string[] = [];
    $: tags = tags;
    const toastStore = getToastStore();
    let tagInput = '';
    export let newTags: string[] = [];

    type TagOption = AutocompleteOption<string, { content: string }>;
    let flavorOptions: TagOption[] = allTags.map(tag => {
        return {
            value: tag.content,
            label: tag.content
        };
    });

    const triggerRepeatInput = (type: string,input: string)=>{
        toastStore.trigger({
            message: `${type} '${input}' Already Added`,
            background: 'bg-warning-200'
        });
    }

    const triggerTagMustBeAValidString = (type: string)=>{
        toastStore.trigger({
            message: `${type} must be a valid non-empty string`,
            background: 'bg-warning-200'
        });
    }

    const triggerExistingTagsCheck = (type: string,input: string)=>{
        toastStore.trigger({
            message: `${type} '${input}' has been created`,
            background: 'variant-filled-success'
        });
    }

    function handleRemoveNewTag(event: CustomEvent<{ chipIndex: number; chipValue: string }>): void {
        if (newTags.includes(event.detail.chipValue)) {
            newTags.splice(newTags.indexOf(event.detail.chipValue), 1);
        }
    }

    const handleEdgeCaseAllTagsEmpty = () => {
        if (tagInput.length === 0) triggerTagMustBeAValidString('Tag');
        else if (tagInput.length>0 && allTags.length === 0 && !newTags.includes(tagInput)) {
            newTags=[...newTags,tagInput];
            tagInput='';
        }
        else if (newTags.includes(tagInput)) {
            triggerRepeatInput('Tag', tagInput.toLowerCase());
        }
    }

    const handleInvalid = () => {
        // if it has valid length, is a valid dropdown option and has not been included yet
        if(tagInput.length>0 && allTags.includes({content: tagInput}) && !tags.includes(tagInput)) {
            tags=[...tags,tagInput];
            newTags=[...newTags,tagInput];
            tagInput='';
        }
        else {
            enterTag = true;
            newTag = tagInput;
            createTag();
            //triggerExistingTagsCheck("Tag",tagInput);
        }
    }

    function onInputChipSelect(e: CustomEvent<TagOption>): void {
        //console.log('onInputChipSelect', e.detail);
        if (!tags.includes(e.detail.value)) {
            inputChip.addChip(e.detail.value);
            tagInput = '';
        }
    }
    let newTag = '';
    let enterTag = false;
    const createTag = () =>{
        if(enterTag){
            if(allTags.includes({ content: newTag })){
                tagInput=newTag;
                enterTag = false;
            }else if(!tags.includes(newTag.toLowerCase()) && newTag !== ''){
                newTags = [...newTags, newTag];
                tags = [...tags,newTag];
                newTag = '';
                tagInput='';
                enterTag = false;
            }else{
                if (newTag === '') {
                    triggerTagMustBeAValidString('Tag');
                }
                else {
                    triggerRepeatInput('Tag', newTag.toLowerCase());
                }
                newTag = '';
                enterTag = false;
            }
        }else{
            newTag = tagInput;
            enterTag=true;
        }
    }
    const enterNewTag = (event: KeyboardEvent) =>{
        if(event.key === 'Enter'){
            event.preventDefault(); // Prevent form submission
            event.stopPropagation(); // Stop bubbling up to the form
            createTag()
        }
    }
    let buttonText = 'Create New Tag';
    $: buttonText = enterTag ? 'Add Tag' : 'Create New Tag';
</script>

<label for="tags_input" class="block font-medium">Tags (at least one)<span class="text-error-300">*</span>:</label>
<div class="text-token space-y-2 mt-1">

        {#if enterTag}
        <input on:keyup={enterNewTag}
               on:keydown={(e) => e.key === 'Enter' && e.preventDefault()}
               bind:value={newTag} placeholder="Enter tag text" class="w-full border-o focus:border-primary-400 focus:ring-0 rounded-lg" />
            <button type="button" class="w-full bg-error-300 rounded-lg py-2 dark-primary-700 text-surface-50" on:click={()=>{enterTag=false}}>Cancel</button>

        {:else}
            <InputChip  bind:this={inputChip} whitelist={allTags.map(t => t.content)}
                        bind:input={tagInput} bind:value={tags} name="chips"
                        on:add={handleEdgeCaseAllTagsEmpty}
                        on:remove={handleRemoveNewTag}
                        chips="items-center gap-1 inline-flex rounded-lg py-1 px-2 whitespace-nowrap variant-soft-primary"
                        on:invalid={handleInvalid} class="dark:bg-transparent dark:border-surface-300 dark:text-surface-300 bg-transparent text-surface-800 border-surface-700"/>
        {/if}
    <button type="button" class="w-full py-2 text-white bg-primary-600 hover:bg-primary-500 rounded-xl shadow-md transition duration-200 dark:text-surface-50" on:click={createTag}>{buttonText}</button>

    <div class="card w-full max-h-48 p-4 overflow-y-auto" tabindex="-1">
        <Autocomplete bind:input={tagInput} options={flavorOptions} denylist={tags}
                      on:selection={onInputChipSelect} emptyState="No Tags Found. Press Enter to Create New Tag." />
    </div>
</div>