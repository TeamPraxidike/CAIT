<script lang="ts">
	import type { LayoutServerData } from '../$types';
	import type { Publication, Tag as PrismaTag } from '@prisma/client';
	import { DifficultySelection, FileTable, lorem, Meta, Render, Tag } from '$lib';
	import { FileDropzone } from '@skeletonlabs/skeleton';
	import { createFileList } from '$lib/util/file';
	import type { PublicationViewLoad } from '../+layout.server';
	import { enhance } from '$app/forms';

	export let data: LayoutServerData;
	let serverData: PublicationViewLoad = data.loadedPublication;
	let publication: Publication = serverData.material.publication;

	let tags: PrismaTag[] = serverData.material.publication.tags;
	let files: FileList = createFileList(serverData.fileData, serverData.material.files);
	let oldFiles: FileList = files;

	let LOs: string[] = [];

	let loInput: HTMLInputElement;
	let tagInput: HTMLInputElement;
</script>

<Meta title={publication.title} description="CAIT" type="site" />

<form action="?/edit" method="POST" enctype="multipart/form-data"
	  class="col-span-full flex flex-col items-start my-20"
	  use:enhance={({ formData }) => {
        Array.from(files).forEach(file => {
          if (file.size > 1024 * 1024 * 100) {
            alert('File size exceeds 100MB');
          } else {
            formData.append('file', file);
          }
        });

        Array.from(oldFiles).forEach(file => {
          if (file.size > 1024 * 1024 * 100) {
            alert('File size exceeds 100MB');
          } else {
            formData.append('oldFile', file);
          }
        });

		serverData.material.files.forEach(file => {
			formData.append('oldFilesTitle', file.type);
			formData.append('oldFilesPath', file.path);
			formData.append('oldFilesType', file.type);
		});
    }}>

	<h2 class="text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold">Edit a publication</h2>
	<div class="flex flex-wrap gap-2 my-2">
		{#each tags as tag}
			<Tag tagText={tag.content} removable={false} />
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
						<button on:click={() => { LOs.push(loInput.value); loInput.value = ""}}
								class="btn bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85">+
						</button>
					</div>
					<div class="flex flex-wrap gap-2">
						{#each LOs as LO}
							<Tag tagText={LO} removable={true} />
						{/each}
					</div>
				</div>
				<div class="w-1/2">
					<label for="tags">Tags:</label>
					<div class="flex gap-2">
						<input type="text" id="tags" bind:this={tagInput}
							   class="rounded-lg dark:bg-surface-800 bg-surface-50 text-surface-700 dark:text-surface-400">
						<button on:click={() => { tags.push({content: tagInput.value}); tagInput.value = ""}}
								class="btn bg-surface-700 text-surface-50 rounded-lg hover:bg-opacity-85">+
						</button>
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
			<div class="flex flex-col gap-4">
				<hr />
				<FileDropzone multiple name="files" bind:files={files} />
				<FileTable operation="edit" {files} />
			</div>
			<button type="submit" class="btn rounded-lg variant-filled-primary text-surface-50">Edit</button>
		</div>
	</div>
</form>