## Project Description

A cookie-clicker style idle game built with SvelteKit + Svelte 5 + TailwindCSS 4. The player clicks a button to earn points and buys buildings that generate points passively. Buildings have exponentially increasing costs (×1.15 per purchase). Points are stored as `BigInt`. State is persisted to `localStorage` via `PersistedState` from the `runed` library.

## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: prettier, eslint, tailwindcss, mcp, runed

## Project Layout

```
src/
  lib/
    game.svelte.ts   # All game state and logic (PersistedState, buildings, tick, buy, click)
  routes/
    +layout.svelte   # Root layout (imports layout.css, sets favicon)
    layout.css       # Global styles (imports tailwindcss)
    +page.svelte     # Main game UI — two-column: clicker (left) + shop (right)
```

### Key design decisions
- **`src/lib/game.svelte.ts`** — Svelte 5 reactive module (`.svelte.ts`) exporting `pointsState`, `ownedState`, `BUILDINGS`, `costOf`, `click`, `buy`, `tick`
- **`pointsState`** — `PersistedState<bigint>` with custom serializer (BigInt ↔ string)
- **`ownedState`** — `PersistedState<Record<BuildingName, number>>` (JSON)
- **Game loop** — `requestAnimationFrame` + `Date.now()` timestamps in a `$effect` inside `+page.svelte`; using wall-clock time (not rAF timestamps) means offline/inactive-tab progress accumulates on return
- **Fractional accumulator** — a plain `number` accumulates sub-1 rates; only whole points are added to the `BigInt`

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
