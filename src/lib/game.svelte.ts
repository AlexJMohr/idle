import { PersistedState } from 'runed';

export const BUILDINGS = [
	{ name: 'Worker', desc: 'Generates a trickle of points.', baseCost: 10n, baseRate: 0.1 },
	{ name: 'Workshop', desc: 'A small automated workshop.', baseCost: 100n, baseRate: 1 },
	{ name: 'Factory', desc: 'Industrial-scale production.', baseCost: 1_100n, baseRate: 10 },
	{ name: 'Datacenter', desc: 'Processes points at scale.', baseCost: 12_000n, baseRate: 50 },
	{ name: 'Megaplex', desc: 'A city-sized point generator.', baseCost: 130_000n, baseRate: 100 },
	{ name: 'Colony', desc: 'An entire self-sustaining colony.', baseCost: 1_500_000n, baseRate: 500 },
	{ name: 'Arcology', desc: 'A closed-loop megastructure city.', baseCost: 20_000_000n, baseRate: 2_500 },
	{ name: 'Orbital', desc: 'A ring station in low orbit.', baseCost: 300_000_000n, baseRate: 12_000 },
	{ name: 'Dyson Sphere', desc: 'Harnesses an entire star.', baseCost: 5_000_000_000n, baseRate: 60_000 },
	{ name: 'Singularity', desc: 'A post-physical point engine.', baseCost: 80_000_000_000n, baseRate: 300_000 }
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
	return BigInt(Math.round(Number(b.baseCost) * Math.pow(1.15, ownedState.current[name] ?? 0)));
}

export function click() {
	pointsState.current += 1n;
}

export function buy(name: BuildingName) {
	const cost = costOf(name);
	if (pointsState.current >= cost) {
		pointsState.current -= cost;
		ownedState.current[name] = (ownedState.current[name] ?? 0) + 1;
	}
}

export function tick(elapsed: number) {
	const pps = BUILDINGS.reduce((sum, b) => sum + (ownedState.current[b.name] ?? 0) * b.baseRate, 0);
	accumulator += pps * elapsed;
	if (accumulator >= 1) {
		const whole = Math.floor(accumulator);
		pointsState.current += BigInt(whole);
		accumulator -= whole;
	}
}
