<script lang="ts">
	export let totalMinutes = 0;
	let interval: NodeJS.Timeout;

	let editTimer = false;

	function formatTime(minutes: number) {
		const hrs = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
	}

	function increment() {
		let inc = 30;
		if (totalMinutes >= 120) inc = 60;
		totalMinutes += inc;
	}

	function decrement() {
		let dec = 30;
		if (totalMinutes >= 120) dec = 60;
		if (totalMinutes >= 30) totalMinutes -= dec;
		else totalMinutes = 0;
	}

	function startHold(action: () => void) {
		action();
		interval = setInterval(action, 120);
	}

	function stopHold() {
		clearInterval(interval);
	}
</script>

<div>
	<p>Time estimate:</p>
	<div class="flex items-center gap-4 bg-gray-100 p-4 rounded-xl w-fit">
		<button
			type="button"
			on:mousedown={() => startHold(increment)}
			on:mouseup={stopHold}
			on:mouseleave={stopHold}
			class="text-xl px-3 py-1 rounded bg-white shadow hover:bg-gray-200"
		>⬆</button>

		{#if editTimer}
			<input
				type="number"
				min="0"
				bind:value={totalMinutes}
				class="text-lg font-semibold text-center max-w-[80px] border border-gray-300 rounded p-1"
				on:blur={() => editTimer = false}
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						editTimer = false;
					}
				}}
			/>
		{:else}
			<div class="text-lg font-semibold text-center min-w-[80px]"
				 role="button"
				 tabindex="0"
				 on:dblclick={() => editTimer = !editTimer}>
				{formatTime(totalMinutes)}
			</div>
		{/if}

		<button
			type="button"
			on:mousedown={() => startHold(decrement)}
			on:mouseup={stopHold}
			on:mouseleave={stopHold}
			class="text-xl px-3 py-1 rounded bg-white shadow hover:bg-gray-200"
		>⬇</button>
	</div>
</div>

