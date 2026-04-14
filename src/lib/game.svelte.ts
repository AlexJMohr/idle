import { PersistedState } from 'runed';

export const BUILDINGS = [
	{ name: 'Worker', desc: 'Generates a trickle of points.', baseCost: 10n, baseRate: 0.1 },
	{ name: 'Workshop', desc: 'A small automated workshop.', baseCost: 100n, baseRate: 1 },
	{ name: 'Factory', desc: 'Industrial-scale production.', baseCost: 1_100n, baseRate: 10 },
	{ name: 'Datacenter', desc: 'Processes points at scale.', baseCost: 12_000n, baseRate: 50 },
	{ name: 'Megaplex', desc: 'A city-sized point generator.', baseCost: 130_000n, baseRate: 100 }
] as const;

export type BuildingName = (typeof BUILDINGS)[number]['name'];

const bigintSerializer = {
	serialize: (v: bigint) => v.toString(),
	deserialize: (s: string) => BigInt(s)
};

export const pointsState = new PersistedState('idlegame-points', 0n, {
	serializer: bigintSerializer
});

export const ownedState = new PersistedState(
	'idlegame-owned',
	Object.fromEntries(BUILDINGS.map((b) => [b.name, 0])) as Record<BuildingName, number>
);

let accumulator = 0;

export function costOf(name: BuildingName): bigint {
	const b = BUILDINGS.find((b) => b.name === name)!;
	return BigInt(Math.round(Number(b.baseCost) * Math.pow(1.15, ownedState.current[name])));
}

export function click() {
	pointsState.current += 1n;
}

export function buy(name: BuildingName) {
	const cost = costOf(name);
	if (pointsState.current >= cost) {
		pointsState.current -= cost;
		ownedState.current[name]++;
	}
}

export function tick(elapsed: number) {
	const pps = BUILDINGS.reduce((sum, b) => sum + ownedState.current[b.name] * b.baseRate, 0);
	accumulator += pps * elapsed;
	if (accumulator >= 1) {
		const whole = Math.floor(accumulator);
		pointsState.current += BigInt(whole);
		accumulator -= whole;
	}
}
