<script lang="ts">
    import Icon from "@iconify/svelte";
    import {getToastStore} from "@skeletonlabs/skeleton";
    let loInput: HTMLInputElement;
    export let LOs: string[] = [];
    export let adding:boolean;
    $: LOs = LOs;

    let editingPK = false;
    let editingLO = false;
    let editingIndexPK: number;
    let editingIndexLO: number;
    let editingPKText:string;
    let editingLOText:string;
    let hoverIndexPK:number;
    let hoverIndexLO: number;
    let displayButton = false;
    let displayButtonLO = false;
    let priorInput: HTMLInputElement;

    export let priorKnowledge:string[] = [];
    $: priorKnowledge = priorKnowledge;

    const toastStore = getToastStore();

    const triggerRepeatInput = (type: string,input: string)=>{
        toastStore.trigger({
            message: `${type} ${input} Already Added`,
            background: 'bg-warning-200'
        });
    }

    const handlePKEdit = (event: KeyboardEvent) => {
        if(event.key === 'Enter'){
            if(editingPKText === ''){
                priorKnowledge = priorKnowledge.filter((_,i) => i !== editingIndexPK);
            }else{
                priorKnowledge[editingIndexPK] = editingPKText;
            }
            editingPK = false;
            editingPKText='';
            editingIndexPK = -1;
        }
    }

    const handleLOPress = (event: KeyboardEvent) =>{
        if (event.key === 'Enter' && loInput.value!=='' ){
            if(LOs.includes(loInput.value)){
                triggerRepeatInput("Learning Objective",loInput.value);
            }else{
                LOs = [...LOs, loInput.value];
                loInput.value = "";
                event.preventDefault();
            }

        }
    }

    const handleLOEdit = (event: KeyboardEvent) => {
        if(event.key === 'Enter'){
            if(editingLOText === ''){
                LOs = LOs.filter((_,i) => i !==editingIndexLO);
            }else{
                LOs[editingIndexLO] = editingLOText;
            }
            editingLO = false;
            editingLOText='';
            editingIndexLO = -1;
        }
    }

    const handlePriorPress = (event: KeyboardEvent) =>{
        if (event.key === 'Enter' && priorInput.value!=='' ){
            if(priorKnowledge.includes(priorInput.value)){
                triggerRepeatInput("Prior Knowledge",priorInput.value);

            }else{
                priorKnowledge = [...priorKnowledge, priorInput.value];
                priorInput.value = "";
                event.preventDefault();
            }

        }
    }

    const submitLO = () => {
        if (LOs.includes(loInput.value)) {
            triggerRepeatInput("Learning Objective",loInput.value)
        } else {
            if(loInput.value!=='') {
                LOs = [...LOs, loInput.value];
                loInput.value = "";
            }
        }
    }

    const submitPrereq = () => {
        if (priorKnowledge.includes(priorInput.value)) {
            triggerRepeatInput("Prior Knowledge",priorInput.value)
        }  if(priorInput.value!=='') {
            priorKnowledge = [...priorKnowledge, priorInput.value];
            priorInput.value = "";
        }
    }

    const deleteLO = (lo: string) => {
        LOs = LOs.filter(x => x !== lo);
    }
    const deletePK = (pk: string) => {
        priorKnowledge = priorKnowledge.filter(x => x !== pk);
    }
</script>



<div class="flex flex-col md:flex-row justify-between gap-10">

    <div class="flex flex-col space-y-1 w-full max-w-full min-w-0">
        <label for="learningObjective" class="block font-medium">Learning Objectives {#if adding}(at least one)<span class="text-error-300">*</span>{/if}:</label>

        <div class="w-full max-w-full">
            {#if adding}
                <div class="w-full flex justify-between items-center gap-2">
                    <input on:keydown={handleLOPress} on:blur={submitLO}  bind:this={loInput}
                           id="learningObjective" type="text" placeholder="Enter learning objective"
                           class="rounded-lg dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400 w-full focus:border-primary-500 focus:ring-0 "/>
                    <button on:click={submitLO} type="button" name="add_LO" inputmode="decimal"
                            class="ml-2 text-center text-surface-50 bg-primary-600 hover:bg-primary-500 rounded-full flex items-center justify-center w-7 h-7 min-w-7 min-h-7 self-center">
                        <Icon icon="mdi:arrow-right-thick" width="20" height="20"  class="text-white" />
                    </button>
                </div>
            {/if}


            <div class="overflow-y-auto max-h-56 mt-1 space-y-1 flex flex-col max-w-full min-w-0">
                {#each LOs as LO, index}
                    {#if editingLO && index === editingIndexLO}
                        <input class="focus:border-primary-500 dark:bg-surface-700 bg-surface-200 focus:ring-0 ring-0 rounded-lg max-h-full w-full text-md"
                               bind:value={editingLOText} on:keypress={handleLOEdit}/>
                    {:else }
                        <div role="table" tabindex="-1" class="p-2 flex rounded-lg justify-between dark:bg-surface-700 bg-surface-200 items-center overflow-hidden w-full" on:mouseenter={()=>{displayButtonLO=true; hoverIndexLO=index}} on:mouseleave={()=>{displayButtonLO=false;}}>
                            <p class="right-1 text-base p-1 rounded-md whitespace-normal break-words hyphens-auto flex-1 min-w-0">{LO}</p>

                            {#if !editingLO && displayButtonLO && hoverIndexLO ===index && adding}
                                <div class=" items-end flex gap-2 flex-none shrink-0 pl-2" >
                                    <button type="button" class="self-center rounded-lg" on:click={() => {editingLO=true; editingIndexLO=index; editingLOText=LO;}}>
                                        <Icon icon="mdi:pencil" width="20" height="20"  class="text-surface-700 dark:text-surface-200 ml-auto hover:text-opacity-85" />
                                    </button>
                                    <button type="button" class=" self-center rounded-lg" on:click={() => {deleteLO(LO)}}>
                                        <Icon icon="mdi:trash-can" width="20" height="20" class="text-error-300 ml-auto dark:text-error-600 hover:text-opacity-85" />
                                    </button>
                                </div>
                            {/if}

                        </div>

                    {/if}
                {/each}
            </div>
        </div>

    </div>

    <div class="flex flex-col space-y-1 w-full min-w-0">
        {#if !adding && priorKnowledge.length !== 0}
            <label for="priorKnowledge" class="block font-medium">Prior Knowledge:</label>
        {:else if adding}
            <label for="priorKnowledge" class="block font-medium">Prior Knowledge:</label>
        {/if}
        {#if adding}
            <div class="flex w-full justify-between items-center gap-2">
                <input   bind:this={priorInput} on:blur={submitPrereq}
                         on:keydown={handlePriorPress} id="priorKnowledge" type="text" placeholder="Enter needed concept"
                         class="rounded-lg dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400 w-full focus:border-primary-500 focus:ring-0"/>
                <button on:click={submitPrereq} type="button" name="add_prior" inputmode="decimal"
                        class="ml-2 text-center text-surface-50 bg-primary-600 hover:bg-primary-500 rounded-full flex items-center justify-center w-7 h-7 min-w-7 min-h-7 self-center">
                    <Icon icon="mdi:arrow-right-thick" width="20" height="20"  class="text-white" />
                </button>
            </div>
        {/if}

        <div class="overflow-y-auto max-h-56 mt-1 space-y-1 flex flex-col max-w-full min-w-0">
            {#each priorKnowledge as pk, index}
                {#if editingPK && index === editingIndexPK}
                    <input class="focus:border-primary-500 bg-surface-200 dark:bg-surface-700 focus:ring-0 ring-0 rounded-lg max-h-full w-full text-md" bind:value={editingPKText} on:keypress={handlePKEdit}/>
                {:else }
                    <div role="table" tabindex="-1" class="p-2 flex rounded-lg justify-between bg-surface-200 dark:bg-surface-700 items-center overflow-hidden w-full" on:mouseenter={()=>{displayButton=true; hoverIndexPK=index}} on:mouseleave={()=>{displayButton=false;}}>
                        <p class="right-1 text-base p-1 rounded-md whitespace-normal break-words hyphens-auto flex-1 min-w-0">{pk}</p>
                        {#if !editingPK && displayButton && hoverIndexPK === index && adding }
                            <div class="items-end flex gap-2 flex-none shrink-0 pl-2" >
                                <button type="button" class="self-center rounded-lg" on:click={() => {editingPK=true; editingIndexPK=index; editingPKText=pk;}}>
                                    <Icon icon="mdi:pencil" width="20" height="20"  class="text-surface-700 dark:text-surface-200 ml-auto hover:text-opacity-85" />
                                </button>
                                <button type="button" class=" self-center rounded-lg" on:click={() => deletePK(pk)}>
                                    <Icon icon="mdi:trash-can" width="20" height="20" class="text-error-300 dark:text-error-600 ml-auto hover:text-opacity-85" />
                                </button>
                            </div>
                        {/if}
                    </div>
                {/if}
            {/each}
        </div>
    </div>
</div>