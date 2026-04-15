<script lang="ts">
	import {
		pointsState,
		ownedState,
		purchasedState,
		revealedState,
		BUILDINGS,
		UPGRADES,
		CLICK_UPGRADES,
		costOf,
		click,
		buy,
		buyUpgrade,
		multiplierFor,
		frenzyMultiplier,
		clickHeatState,
		tick,
		reset,
		type BuildingName
	} from '$lib/game.svelte';

	const purchasedFrenzyLevels = $derived(
		CLICK_UPGRADES.filter((u) => purchasedState.current[u.id]).length
	);

	const maxFrenzy = $derived(1 + purchasedFrenzyLevels);

	const basePPS = $derived(
		BUILDINGS.reduce(
			(sum, b) => sum + (ownedState.current[b.name] ?? 0) * b.baseRate * multiplierFor(b.name),
			0
		)
	);

	const pointsPerSecond = $derived(Math.floor(basePPS) * frenzyMultiplier());


	const fmtCompact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
	const fmtStandard = new Intl.NumberFormat('en');

	function fmt(n: bigint | number): string {
		const v = typeof n === 'bigint' ? Number(n) : n;
		return v >= 1e6 ? fmtCompact.format(v) : fmtStandard.format(Math.floor(v));
	}

	let activeTab: 'buildings' | 'upgrades' = $state('buildings');

	if (import.meta.env.DEV) {
		$effect(() => {
			Object.assign(window, { cheat: { pointsState, purchasedState, reset } });
		});
	}

	const visibleClickUpgrades = $derived.by(() => {
		const nextIdx = CLICK_UPGRADES.findIndex((u) => !purchasedState.current[u.id]);
		return nextIdx === -1 ? [...CLICK_UPGRADES] : CLICK_UPGRADES.slice(0, nextIdx + 1);
	});

	const visibleBuildings = $derived.by(() => {
		const result: (typeof BUILDINGS)[number][] = [];
		for (let i = 0; i < BUILDINGS.length; i++) {
			const b = BUILDINGS[i];
			const owned = (ownedState.current[b.name] ?? 0) > 0;
			const revealed = !!revealedState.current[b.name];
			if (owned || revealed) {
				result.push(b);
			} else if (i <= 1 || pointsState.current >= b.baseCost / 10n) {
				result.push(b);
				break;
			} else {
				break;
			}
		}
		return result;
	});

	$effect(() => {
		const unseen = visibleBuildings.filter((b) => !revealedState.current[b.name]);
		if (unseen.length > 0) {
			const updates = Object.fromEntries(unseen.map((b) => [b.name, true]));
			revealedState.current = { ...revealedState.current, ...updates };
		}
	});

	$effect(() => {
		let lastTime = Date.now();
		let frameId: number;

		function frame() {
			const now = Date.now();
			tick((now - lastTime) / 1000);
			lastTime = now;
			frameId = requestAnimationFrame(frame);
		}

		frameId = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(frameId);
	});
</script>

<div class="flex h-screen font-mono text-sm">
	<!-- Left: clicker -->
	<div class="flex flex-1 flex-col items-center justify-center gap-4 border-r border-gray-200">
		<div class="text-5xl font-bold tabular-nums">{fmt(pointsState.current)}</div>

		<button
			onclick={click}
			class="mt-4 rounded-lg bg-gray-900 px-14 py-8 text-lg font-semibold text-white transition-transform select-none hover:bg-gray-700 active:scale-95"
		>
			Click
		</button>

		<div class="flex w-48 flex-col items-center gap-1 {purchasedFrenzyLevels === 0 ? 'invisible' : ''}">
				<div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
					<div
						class="h-full rounded-full bg-orange-400 transition-all duration-75"
						style="width: {clickHeatState.current * 100}%"
					></div>
				</div>
				<div class="text-xs {clickHeatState.current > 0.05 ? 'text-orange-400' : 'text-gray-300'}">
					×{frenzyMultiplier().toFixed(2)} frenzy (max ×{maxFrenzy})
				</div>
			</div>

		<div class="text-center text-gray-400">
			<div>{fmt(pointsPerSecond)} / sec</div>
		</div>

		<button
			onclick={() => confirm('Reset all progress?') && reset()}
			class="mt-4 text-xs text-gray-300 hover:text-gray-500 transition-colors"
		>
			Reset
		</button>
	</div>

	<!-- Right: shop -->
	<div class="flex w-72 flex-col overflow-hidden">
		<!-- Tabs -->
		<div class="flex shrink-0 border-b border-gray-200">
			<button
				onclick={() => (activeTab = 'buildings')}
				class="flex-1 px-4 py-3 text-xs font-semibold tracking-widest uppercase transition-colors {activeTab ===
				'buildings'
					? 'border-b-2 border-gray-900 text-gray-900'
					: 'text-gray-400 hover:text-gray-600'}"
			>
				Buildings
			</button>
			<button
				onclick={() => (activeTab = 'upgrades')}
				class="flex-1 px-4 py-3 text-xs font-semibold tracking-widest uppercase transition-colors {activeTab ===
				'upgrades'
					? 'border-b-2 border-gray-900 text-gray-900'
					: 'text-gray-400 hover:text-gray-600'}"
			>
				Upgrades
			</button>
		</div>

		<!-- Buildings tab -->
		{#if activeTab === 'buildings'}
			<div class="overflow-y-auto">
				{#each visibleBuildings as building (building.name)}
					{@const cost = costOf(building.name as BuildingName)}
					{@const canAfford = pointsState.current >= cost}
					<button
						onclick={() => buy(building.name as BuildingName)}
						disabled={!canAfford}
						class="flex w-full items-center justify-between border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-35"
					>
						<div class="min-w-0">
							<div class="font-semibold">{building.name}</div>
							<div class="truncate text-gray-400">{building.desc}</div>
							<div class="text-gray-300">
								+{building.baseRate * multiplierFor(building.name as BuildingName)}/sec each
							</div>
						</div>
						<div class="ml-3 shrink-0 text-right">
							<div class="font-semibold">{fmt(cost)}</div>
							<div class="text-gray-400">{ownedState.current[building.name] ?? 0} owned</div>
						</div>
					</button>
				{/each}
			</div>
		{/if}

		<!-- Upgrades tab -->
		{#if activeTab === 'upgrades'}
			<div class="overflow-y-auto">
				<!-- Click upgrades -->
				<div
					class="border-b border-gray-200 px-4 py-2 text-xs font-semibold tracking-widest text-gray-400 uppercase"
				>
					Clicking
				</div>
				{#each visibleClickUpgrades as u (u.id)}
					{@const purchased = !!purchasedState.current[u.id]}
					{@const canAfford = pointsState.current >= u.cost}
					<div class="flex items-center justify-between border-b border-gray-100 px-4 py-3 {purchased ? 'opacity-35' : ''}">
						<div class="min-w-0">
							<div class="font-semibold">{u.name}</div>
							<div class="truncate text-gray-400">{u.desc}</div>
						</div>
						<div class="ml-3 shrink-0 text-right">
							{#if purchased}
								<div class="text-gray-400">✓</div>
							{:else}
								<button
									onclick={() => buyUpgrade(u.id, u.cost)}
									disabled={!canAfford}
									class="rounded border border-gray-200 px-2 py-1 text-xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
								>
									<div>{fmt(u.cost)}</div>
								</button>
							{/if}
						</div>
					</div>
				{:else}
					<div class="px-4 py-3 text-gray-300">All click upgrades purchased.</div>
				{/each}

				<!-- Building upgrades -->
				<div
					class="border-b border-gray-200 px-4 py-2 text-xs font-semibold tracking-widest text-gray-400 uppercase"
				>
					Buildings
				</div>
				{#each UPGRADES as u (u.id)}
					{@const purchased = !!purchasedState.current[u.id]}
					{@const unlocked = (ownedState.current[u.building] ?? 0) >= u.requires}
					{@const canAfford = pointsState.current >= u.cost}
					<div
						class="flex items-center justify-between border-b border-gray-100 px-4 py-3 {purchased
							? 'opacity-35'
							: ''}"
					>
						<div class="min-w-0">
							<div class="font-semibold">{u.building}</div>
							<div class="truncate text-gray-400">{u.desc}</div>
							{#if !purchased && !unlocked}
								<div class="text-gray-300">need {u.requires} owned</div>
							{/if}
						</div>
						<div class="ml-3 shrink-0 text-right">
							{#if purchased}
								<div class="text-gray-400">✓</div>
							{:else}
								<button
									onclick={() => buyUpgrade(u.id, u.cost)}
									disabled={!unlocked || !canAfford}
									class="rounded border border-gray-200 px-2 py-1 text-xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
								>
									<div>{fmt(u.cost)}</div>
									<div class="text-gray-400">(×2)</div>
								</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
