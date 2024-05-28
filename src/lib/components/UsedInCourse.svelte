<script lang="ts">
    import Icon from "@iconify/svelte";

    export let courses = ["Machine learning", "CSE 2430"];

    let addingCourse = false;
    let editing = -1;
    let inputValue = "";
    let hoveredIndex: number = -1;

    function submit(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            add();
        }
    }
    const add = () => {
        if(inputValue !== ""){
            courses = [...courses, inputValue];
        }
        addingCourse = false;
        inputValue = "";
    };
    const cancel = () => {
        addingCourse = false;
        editing = -1;
        inputValue = "";
    };

    const toggleEdit = (index: number) => {
        editing = index;
        inputValue = courses[index]
    }
    const confirmEdit = () => {
        courses[editing] = inputValue;
        inputValue = "";
        editing = -1;
    }

</script>


<div class="flex items-center flex-col rounded-lg p-4 space-y-3 shadow-md bg-surface-100 dark:bg-surface-800 border dark:border-none w-80">
    {#if courses.length === 0}
        <h4>Add a course you are using this in</h4>
    {:else if courses.length === 1}
        <h4>You are using this in 1 course</h4>
    {:else}
        <h4>You are using this in {courses.length} courses</h4>
    {/if}

    {#each courses as course, i}
        {#if editing === i}
            <input type="text" on:keydown={submit} class="rounded-lg bg-surface-100 w-full" bind:value={inputValue}>
        {:else}
            <div class="flex justify-between py-1 px-4 bg-surface-200 text-surface-800 rounded-lg w-full items-center text-wrap"
                 on:mouseenter={() => {hoveredIndex = i}}
                 on:mouseleave={() => {hoveredIndex = -1}}
                 role="table">

                <p class="relative mt-2 right-1 text-base p-1 rounded-md" >{course}</p>
                {#if i === hoveredIndex}
                    <div class="flex items-end">
                        <button class="flex flex-row justify-center cursor-pointer self-center" on:click={() => toggleEdit(i)}>
                            <Icon icon="mdi:pencil" width="24" height="24"  class="text-surface-700 ml-auto hover:text-opacity-85" />
                        </button>

                        <button class="flex flex-row justify-center cursor-pointer self-center" on:click={() => {courses = courses.filter((_, index) => index !== i)}}>
                            <Icon icon="mdi:trash-can" width="24" height="24" class="text-error-300 ml-auto hover:text-opacity-85" />
                        </button>
                    </div>
                {/if}
            </div>
        {/if}
    {/each}

    {#if addingCourse}
        <input type="text" on:keydown={submit} class="rounded-lg bg-surface-100 w-full" bind:value={inputValue} placeholder="Course name">

        <div>
            <button on:click={add} class="py-1 px-4 bg-surface-700 text-surface-50 rounded-md hover:bg-opacity-85">Add</button>
            <button on:click={cancel} class="py-1 px-4 bg-error-400 text-surface-50 rounded-md hover:bg-opacity-85">Cancel</button>
        </div>
    {:else if editing > -1}
        <div>
            <button on:click={confirmEdit} class="py-1 px-4 bg-surface-700 text-surface-50 rounded-md hover:bg-opacity-85">Confirm</button>
            <button on:click={cancel} class="py-1 px-4 bg-error-400 text-surface-50 rounded-md hover:bg-opacity-85">Cancel</button>
        </div>
    {:else}
        <button on:click={() => addingCourse = true} class="py-1 px-4 bg-surface-700 text-surface-50 rounded-md hover:bg-opacity-85">Add new course</button>
    {/if}
</div>
