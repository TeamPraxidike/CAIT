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

</script>



<div class="flex flex-row justify-between">

    <div class="flex flex-col space-y-1 w-full p-3 max-w-full">
        <label for="learningObjective" >Learning Objectives {#if adding}(at least one)<span class="text-error-300">*</span>{/if} :</label>

        <div class="w-full max-w-full">
            {#if adding}
                <div class="w-full flex justify-between gap-2">
                    <input on:keydown={handleLOPress} on:blur={submitLO}  bind:this={loInput}
                           id="learningObjective" type="text" placeholder="Enter learning objective"
                           class="rounded-lg dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400 w-full focus:border-primary-400 focus:ring-0 "/>
                    <button on:click={submitLO} type="button" name="add_LO" inputmode="decimal"
                            class="text-center">
                        <Icon icon="mdi:plus-circle" width="32" height="32"  class="bg-surface-0 text-surface-800 hover:text-surface-600" />
                    </button>
                </div>
            {/if}


            <div class="overflow-y-auto max-h-56 mt-1 space-y-1 flex flex-col max-w-full">
                {#each LOs as LO, index}

                    {#if editingLO && index === editingIndexLO}
                        <input class="focus:border-primary-400 bg-surface-200 focus:ring-0 ring-0 rounded-lg max-h-full w-full text-md"
                               bind:value={editingLOText} on:keypress={handleLOEdit}/>
                    {:else }

                        <div role="table" tabindex="-1" class="p-2 flex rounded-lg justify-between bg-surface-200 items-center text-wrap shrink break-words" on:mouseenter={()=>{displayButtonLO=true; hoverIndexLO=index}} on:mouseleave={()=>{displayButtonLO=false;}}>
                            <p class="right-1 text-base p-1 rounded-md break-words max-w-4/5">{LO}</p>

                            {#if !editingLO && displayButtonLO && hoverIndexLO ===index && adding}
                                <div class=" items-end flex gap-2" >
                                    <button type="button" class="self-center rounded-lg" on:click={() => {editingLO=true; editingIndexLO=index; editingLOText=LO;}}>
                                        <Icon icon="mdi:pencil" width="20" height="20"  class="text-surface-700 ml-auto hover:text-opacity-85" />
                                    </button>
                                    <button type="button" class=" self-center rounded-lg" on:click={() => {LOs = LOs.filter(x=>x!==LO)}}>
                                        <Icon icon="mdi:trash-can" width="20" height="20" class="text-error-300 ml-auto hover:text-opacity-85" />
                                    </button>
                                </div>
                            {/if}

                        </div>

                    {/if}
                {/each}
            </div>
        </div>

    </div>

    <div class="flex flex-col space-y-1 w-full p-3">
        {#if !adding && priorKnowledge.length !== 0}
            <label for="priorKnowledge" >Prior Knowledge:</label>
        {:else if adding}
            <label for="priorKnowledge" >Prior Knowledge:</label>
        {/if}
        {#if adding}
            <div class="flex w-full justify-between gap-2">
                <input   bind:this={priorInput} on:blur={submitPrereq}
                         on:keydown={handlePriorPress} id="priorKnowledge" type="text" placeholder="Enter needed concept"
                         class="rounded-lg dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400 w-full focus:border-primary-400 focus:ring-0"/>
                <button on:click={submitPrereq} type="button" name="add_prior" inputmode="decimal"
                        class="text-center">
                    <Icon icon="mdi:plus-circle" width="32" height="32"  class="bg-surface-0 text-surface-800 hover:text-surface-600" />
                </button>
            </div>
        {/if}

        <div class="overflow-y-auto max-h-56 mt-1 space-y-1 flex flex-col max-w-full">
            {#each priorKnowledge as pk, index}
                {#if editingPK && index === editingIndexPK}
                    <input class="focus:border-primary-400 bg-surface-200 focus:ring-0 ring-0 rounded-lg max-h-full w-full text-md" bind:value={editingPKText} on:keypress={handlePKEdit}/>
                {:else }
                    <div role="table" tabindex="-1" class="p-2 flex rounded-lg justify-between bg-surface-200 items-center text-wrap shrink break-words" on:mouseenter={()=>{displayButton=true; hoverIndexPK=index}} on:mouseleave={()=>{displayButton=false;}}>
                        <p class="right-1 text-base p-1 rounded-md break-words max-w-full">{pk}</p>
                        {#if !editingPK && displayButton && hoverIndexPK === index && adding }
                            <div class="items-end flex gap-2" >
                                <button type="button" class="self-center rounded-lg" on:click={() => {editingPK=true; editingIndexPK=index; editingPKText=pk;}}>
                                    <Icon icon="mdi:pencil" width="20" height="20"  class="text-surface-700 ml-auto hover:text-opacity-85" />
                                </button>
                                <button type="button" class=" self-center rounded-lg" on:click={() => {priorKnowledge = priorKnowledge.filter(x=>x!==pk)}}>
                                    <Icon icon="mdi:trash-can" width="20" height="20" class="text-error-300 ml-auto hover:text-opacity-85" />
                                </button>
                            </div>
                        {/if}
                    </div>
                {/if}
            {/each}
        </div>
    </div>
</div>