<script lang="ts">
    import type {LayoutServerData} from './$types';
    import type {File, Publication} from "@prisma/client";
    import {DifficultySelection, FileTable, lorem, Meta, Render, Tag} from "$lib";
    import {FileDropzone} from "@skeletonlabs/skeleton";

    export let data: LayoutServerData;
    let publication: Publication = data.publication;

    let tags: string[] = ['Very Big Tag', 'nsnsngrfnfgdb', 'One More ', 'short'];
    let files = [
        {
            path: "slides.pdf",
            title: "slides.pdf",
            materialId: 1
        }, {
            path: "slide.pptx",
            title: "slide.pptx",
            materialId: 1
        }, {
            path: "code.py",
            title: "code.py",
            materialId: 1
        }, {
            path: "README.md",
            title: "README.md",
            materialId: 1
        }
    ]

    let activeFile: File = files[0];

    let LOs:string[] = [];

    let loInput:HTMLInputElement;
    let tagInput:HTMLInputElement;
</script>

<Meta title={publication.title} description="CAIT" type="site"/>

<form class="col-span-full flex flex-col items-start my-20">
    <h2 class="text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold">Edit a publication</h2>
    <div class="flex flex-wrap gap-2 my-2">
        {#each tags as tag}
            <Tag tagText={tag} removable={false}/>
        {/each}
    </div>
    <div class="w-full flex flex-col lg:grid gap-8 grid-cols-2 mt-12">
        <div class="flex flex-col w-full gap-8">
            <div class="flex gap-4 items-center">
                <label for="title">Title:</label>
                <input type="text" id="title"
                       class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400">
            </div>

            <div class="flex flex-col gap-2">
                <label for="description">Description:</label>
                <textarea id="description"
                          class="rounded-lg h-40 resize-y dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400">
                    {lorem + lorem}
                </textarea>
            </div>

            <div class="flex gap-4 items-center">
                <label for="description">Difficulty:</label>
                <DifficultySelection difficulty="easy" />
            </div>

            <div class="flex gap-2">
                <div class="w-1/2">
                    <label for="learning-objectives">Learning Objectives:</label>
                    <div class="flex gap-2">
                        <input type="text" id="learning-objectives" bind:this={loInput}
                               class="rounded-lg dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400">
                        <button on:click={() => { LOs = [...LOs, loInput.value]; loInput.value = ""}}
                                class="btn bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85">+</button>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        {#each LOs as LO}
                            <Tag tagText={LO} removable={true}/>
                        {/each}
                    </div>
                </div>
                <div class="w-1/2">
                    <label for="tags">Tags:</label>
                    <div class="flex gap-2">
                        <input type="text" id="tags" bind:this={tagInput}
                               class="rounded-lg dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400">
                        <button on:click={() => { tags = [...tags, tagInput.value]; tagInput.value = ""}}
                                class="btn bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85">+</button>
                    </div>
                </div>
            </div>

            <div class="flex gap-2">
                <div class="w-1/2">
                    <label for="estimate">Time Estimate:</label>
                    <input type="text" id="estimate"
                           class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400">
                </div>
                <div class="w-1/2">
                    <label for="copyright">Copyright:</label>
                    <input type="text" id="copyright"
                           class="rounded-lg dark:bg-surface-800 bg-surface-50 w-full text-surface-700 dark:text-surface-400">
                </div>
            </div>
        </div>
        <Render {activeFile}/>
        <div class="flex flex-col gap-4">
            <hr />
            <FileDropzone name="a" />
            <FileTable {files} bind:activeFile={activeFile}/>
        </div>
        <button class="btn rounded-lg variant-filled-primary text-surface-50">Edit</button>
    </div>
</form>