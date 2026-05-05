<script lang="ts">
	export let className = '';
	export let forArrow = false;
	export let onCoverClick = () => {};
	export let titleText: string;

	// Cover
	export let href: string;

	// Content
	export let description: string | null = null;

	const defaultCoverPicturePath = '/defaultCoverPic/assignment.jpg';
</script>

<div class="{className} flex items-center">
	{#if forArrow}
		<div class="carrow shadow-lg" />
	{/if}
	<div
		class=" w-full h-[360px] rounded-lg shadow-md bg-surface-50 dark:bg-surface-800 border dark:border-none">
		<div class="w-full relative h-2/5 rounded-t-lg">
			<slot name="badge" />
			<a
				{href}
				class="flex-none"
				aria-label=""
				on:click={onCoverClick}>
				<slot name="cover">
					<img
						class="w-full h-full object-cover rounded-t-lg hover:shadow-md select-none"
						src={defaultCoverPicturePath}
						draggable="false"
						alt="" />
				</slot>
			</a>
		</div>
		<div
			class="flex flex-col justify-between px-2 py-2 w-full h-3/5 border-t border-surface-300 dark:border-surface-700 items-center justify-elements-center">
			<!-- Title and difficulty -->
			<div class="w-full">
				<div class="flex items-start justify-between gap-2">
					<!-- Title region: takes remaining space and can shrink -->
					<div class="flex-1 min-w-0">
						<a
							href={href}
							class="block line-clamp-2 font-bold text-surface-700 text-sm dark:text-surface-200 hover:text-surface-500"
							on:click={onCoverClick}>
							{titleText}
						</a>
					</div>

					<!-- Icons region: fixed-size, stays on the right -->
					<div class="shrink-0 flex items-center gap-2">
						<slot name="icons" />
					</div>
				</div>
				<slot name="meta" />
			</div>
			{#if description}
				<p
					class="w-full line-clamp-3 text-xs text-surface-700 dark:text-surface-400">
					{description}
				</p>
			{/if}

			<slot name="tags" />

			<div class="w-full space-y-2">
				<hr class="opacity-50" />
				<div class="w-full flex justify-between">
					<div class="w-full flex justify-left space-x-4">
						<slot name="interaction-buttons">buttons</slot>
					</div>

					<div class="flex gap-1 items-center {$$slots['like-and-save'] ? 'pr-5' : 'pr-0'}">
						<slot name="like-and-save"></slot>
						
						<slot name="user-pfp"></slot>
					</div>
				</div>
			</div>
		</div>
		<slot name="modal"/>
	</div>

	<!-- <Modal components={modalRegistry} /> -->
</div>
