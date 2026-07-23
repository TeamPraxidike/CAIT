<script lang="ts">
	import { Meta } from '$lib';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<Meta title="Publication archive" description="Archived CAIT publications" type="site" />

<section class="col-span-full mt-12 space-y-6">
	<div>
		<h1 class="text-3xl font-semibold">Publication archive</h1>
		<p class="mt-2 text-surface-500">
			Archived publications are hidden from CAIT but remain available to restore.
		</p>
	</div>

	{#if data.publications.length === 0}
		<p class="rounded-lg bg-surface-100 p-6 dark:bg-surface-800">
			There are no archived publications.
		</p>
	{:else}
		<div class="space-y-4">
			{#each data.publications as publication}
				<article class="rounded-lg border border-surface-300 p-5 dark:border-surface-700">
					<div class="flex flex-wrap items-start justify-between gap-4">
						<div class="space-y-2">
							<div class="flex flex-wrap items-center gap-2">
								<h2 class="text-xl font-semibold">{publication.title}</h2>
								<span class="rounded-full bg-surface-200 px-2 py-1 text-xs dark:bg-surface-700">
									{publication.type}
								</span>
							</div>
							<p class="text-sm text-surface-500">
								By {publication.publisher.firstName} {publication.publisher.lastName}
								{#if publication.archivedAt}
									· Archived {new Date(publication.archivedAt).toLocaleDateString()}
								{/if}
							</p>
							{#if publication.archiveReason}
								<p>{publication.archiveReason}</p>
							{/if}
							<div class="flex flex-wrap gap-2">
								{#each publication.tags as tag}
									<span class="rounded-full bg-primary-100 px-2 py-1 text-xs text-primary-700">
										{tag.content}
									</span>
								{/each}
							</div>
						</div>

						<form method="POST" action="?/restore">
							<input type="hidden" name="publicationId" value={publication.id} />
							<button class="btn variant-filled-primary" type="submit">Restore</button>
						</form>
					</div>
				</article>
			{/each}
		</div>
	{/if}

	<div class="pt-6">
		<h2 class="text-2xl font-semibold">Archived courses</h2>
		<p class="mt-2 text-surface-500">
			Course publication links are preserved and return when the course is restored.
		</p>
	</div>

	{#if data.courses.length === 0}
		<p class="rounded-lg bg-surface-100 p-6 dark:bg-surface-800">
			There are no archived courses.
		</p>
	{:else}
		<div class="space-y-4">
			{#each data.courses as course}
				<article class="rounded-lg border border-surface-300 p-5 dark:border-surface-700">
					<div class="flex flex-wrap items-start justify-between gap-4">
						<div class="space-y-2">
							<h3 class="text-xl font-semibold">{course.courseName}</h3>
							<p class="text-sm text-surface-500">
								{course.educationalLevel}
								{#if course.archivedAt}
									· Archived {new Date(course.archivedAt).toLocaleDateString()}
								{/if}
							</p>
							<p class="text-sm">
								{course.publications.length} linked {course.publications.length === 1 ? 'publication' : 'publications'}
							</p>
							{#if course.archiveReason}
								<p>{course.archiveReason}</p>
							{/if}
						</div>

						<form method="POST" action="?/restore">
							<input type="hidden" name="resourceType" value="course" />
							<input type="hidden" name="courseId" value={course.id} />
							<button class="btn variant-filled-primary" type="submit">Restore</button>
						</form>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</section>
