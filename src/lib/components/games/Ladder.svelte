<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Application, Graphics, Text, Container, BlurFilter } from 'pixi.js';
	import { generateLadder, traceLadderPath, type LadderData, type PathPoint } from '$lib/services/ladder';
	import * as m from '$lib/paraglide/messages.js';

	interface PlayerState {
		path: PathPoint[];
		progress: number;
		finalColumn: number;
		color: number;
		graphics: Graphics | null;
		head: Graphics | null;
	}

	let containerEl: HTMLDivElement;
	let app: Application | null = null;
	let ladderContainer: Container | null = null;
	let pathContainer: Container | null = null;

	let playerCount = $state(4);
	let excludeSelf = $state(false);
	let ladder = $state<LadderData | null>(null);
	let players = $state<PlayerState[]>([]);
	let isRunning = $state(false);
	let finalResults = $state<Map<number, number>>(new Map());

	const cellWidth = 100;
	const cellHeight = 50;
	const startY = 80;
	const colors = [0xe53935, 0xfb8c00, 0xfdd835, 0x43a047, 0x00acc1, 0x1e88e5, 0x8e24aa, 0xd81b60];

	onMount(async () => {
		app = new Application();
		await app.init({
			background: 0x1a1a2e,
			antialias: true,
			resolution: window.devicePixelRatio || 1,
			autoDensity: true
		});
		containerEl.appendChild(app.canvas);

		ladderContainer = new Container();
		pathContainer = new Container();
		app.stage.addChild(ladderContainer);
		app.stage.addChild(pathContainer);

		regenerateLadder();
	});

	onDestroy(() => {
		if (app) {
			app.destroy(true, { children: true });
		}
	});

	function regenerateLadder() {
		ladder = generateLadder({ playerCount, excludeSelf });
		resetState();
		renderLadder();
	}

	function resetState() {
		players = [];
		isRunning = false;
		finalResults = new Map();
		if (pathContainer) {
			pathContainer.removeChildren();
		}
	}

	function getX(col: number) {
		return col * cellWidth + cellWidth / 2 + 50;
	}

	function getY(row: number) {
		return row * cellHeight + startY + cellHeight / 2;
	}

	function renderLadder() {
		if (!app || !ladder || !ladderContainer) return;

		ladderContainer.removeChildren();

		const width = playerCount * cellWidth + 100;
		const height = ladder.rowCount * cellHeight + startY + 120;
		app.renderer.resize(width, height);

		const bg = new Graphics();
		bg.rect(0, 0, width, height).fill({ color: 0x1a1a2e });
		ladderContainer.addChild(bg);

		for (let col = 0; col < playerCount; col++) {
			const line = new Graphics();
			line.moveTo(getX(col), startY);
			line.lineTo(getX(col), ladder.rowCount * cellHeight + startY);
			line.stroke({ width: 3, color: 0x4a4a6a, alpha: 0.6 });
			ladderContainer.addChild(line);
		}

		for (let row = 0; row < ladder.rowCount; row++) {
			for (let col = 0; col < playerCount - 1; col++) {
				if (ladder.rungs[row][col]) {
					const rung = new Graphics();
					rung.moveTo(getX(col), getY(row));
					rung.lineTo(getX(col + 1), getY(row));
					rung.stroke({ width: 3, color: 0x6a6a8a, alpha: 0.5 });
					ladderContainer.addChild(rung);
				}
			}
		}

		for (let col = 0; col < playerCount; col++) {
			const btn = new Graphics();
			btn.circle(getX(col), 40, 28);
			btn.fill({ color: 0x3a3a5a });
			btn.stroke({ width: 3, color: 0x5a5a7a });
			btn.eventMode = 'static';
			btn.cursor = 'pointer';
			btn.on('pointerdown', () => startSingle(col));
			btn.on('pointerover', () => {
				btn.tint = 0xaaaaff;
			});
			btn.on('pointerout', () => {
				btn.tint = 0xffffff;
			});
			ladderContainer.addChild(btn);

			const label = new Text({
				text: String(col + 1),
				style: { fontSize: 20, fontWeight: 'bold', fill: 0xffffff }
			});
			label.anchor.set(0.5);
			label.x = getX(col);
			label.y = 40;
			ladderContainer.addChild(label);
		}

		const exitY = ladder.rowCount * cellHeight + startY + 40;
		for (let col = 0; col < playerCount; col++) {
			const exit = new Graphics();
			exit.roundRect(getX(col) - 30, exitY, 60, 40, 8);
			exit.fill({ color: 0x2a2a4a });
			exit.stroke({ width: 2, color: 0x4a4a6a });
			ladderContainer.addChild(exit);

			const label = new Text({
				text: String(col + 1),
				style: { fontSize: 18, fontWeight: 'bold', fill: 0x888888 }
			});
			label.anchor.set(0.5);
			label.x = getX(col);
			label.y = exitY + 20;
			ladderContainer.addChild(label);
		}
	}

	async function startSingle(startCol: number) {
		if (isRunning || !ladder || !app) return;
		resetState();
		isRunning = true;

		const trace = traceLadderPath(ladder, startCol, playerCount, cellWidth, cellHeight, startY);
		const color = colors[startCol % colors.length];

		const pathGraphics = new Graphics();
		const glowGraphics = new Graphics();
		glowGraphics.filters = [new BlurFilter({ strength: 8 })];

		const head = new Graphics();
		head.circle(0, 0, 12);
		head.fill({ color });

		pathContainer?.addChild(glowGraphics);
		pathContainer?.addChild(pathGraphics);
		pathContainer?.addChild(head);

		players = [{
			path: trace.path,
			progress: 0,
			finalColumn: trace.finalColumn,
			color,
			graphics: pathGraphics,
			head
		}];

		await animatePath(trace.path, pathGraphics, glowGraphics, head, color);

		finalResults = new Map([[startCol, trace.finalColumn]]);
		highlightExit(trace.finalColumn, color);
		isRunning = false;
	}

	async function startAll() {
		if (isRunning || !ladder || !app) return;
		resetState();
		isRunning = true;

		const traces = [];
		for (let i = 0; i < playerCount; i++) {
			const trace = traceLadderPath(ladder, i, playerCount, cellWidth, cellHeight, startY);
			const color = colors[i % colors.length];

			const pathGraphics = new Graphics();
			const glowGraphics = new Graphics();
			glowGraphics.filters = [new BlurFilter({ strength: 8 })];

			const head = new Graphics();
			head.circle(0, 0, 12);
			head.fill({ color });

			pathContainer?.addChild(glowGraphics);
			pathContainer?.addChild(pathGraphics);
			pathContainer?.addChild(head);

			traces.push({ trace, pathGraphics, glowGraphics, head, color, startCol: i });
		}

		await Promise.all(
			traces.map(({ trace, pathGraphics, glowGraphics, head, color }) =>
				animatePath(trace.path, pathGraphics, glowGraphics, head, color)
			)
		);

		const results = new Map<number, number>();
		traces.forEach(({ trace, startCol, color }) => {
			results.set(startCol, trace.finalColumn);
			highlightExit(trace.finalColumn, color);
		});
		finalResults = results;
		isRunning = false;
	}

	async function animatePath(
		path: PathPoint[],
		graphics: Graphics,
		glow: Graphics,
		head: Graphics,
		color: number
	) {
		const totalPoints = path.length;
		const duration = totalPoints * 100;
		const startTime = performance.now();

		return new Promise<void>((resolve) => {
			const animate = () => {
				const elapsed = performance.now() - startTime;
				const progress = Math.min(elapsed / duration, 1);
				const pointIndex = Math.floor(progress * (totalPoints - 1));

				graphics.clear();
				glow.clear();

				if (pointIndex > 0) {
					graphics.moveTo(path[0].x, path[0].y);
					glow.moveTo(path[0].x, path[0].y);

					for (let i = 1; i <= pointIndex; i++) {
						graphics.lineTo(path[i].x, path[i].y);
						glow.lineTo(path[i].x, path[i].y);
					}

					if (pointIndex < totalPoints - 1) {
						const t = (progress * (totalPoints - 1)) % 1;
						const curr = path[pointIndex];
						const next = path[pointIndex + 1];
						const x = curr.x + (next.x - curr.x) * t;
						const y = curr.y + (next.y - curr.y) * t;
						graphics.lineTo(x, y);
						glow.lineTo(x, y);
						head.x = x;
						head.y = y;
					} else {
						head.x = path[totalPoints - 1].x;
						head.y = path[totalPoints - 1].y;
					}

					graphics.stroke({ width: 4, color, cap: 'round', join: 'round' });
					glow.stroke({ width: 8, color, alpha: 0.4, cap: 'round', join: 'round' });
				} else {
					head.x = path[0].x;
					head.y = path[0].y;
				}

				if (progress < 1) {
					requestAnimationFrame(animate);
				} else {
					resolve();
				}
			};

			animate();
		});
	}

	function highlightExit(col: number, color: number) {
		if (!ladder || !ladderContainer) return;

		const exitY = ladder.rowCount * cellHeight + startY + 40;
		const highlight = new Graphics();
		highlight.roundRect(getX(col) - 30, exitY, 60, 40, 8);
		highlight.fill({ color });
		highlight.stroke({ width: 3, color: 0xffffff });
		ladderContainer.addChild(highlight);

		const label = new Text({
			text: String(col + 1),
			style: { fontSize: 18, fontWeight: 'bold', fill: 0xffffff }
		});
		label.anchor.set(0.5);
		label.x = getX(col);
		label.y = exitY + 20;
		ladderContainer.addChild(label);
	}

</script>

<div class="flex flex-col items-center gap-4">
	<div class="flex gap-3 items-center flex-wrap justify-center">
		<label class="flex items-center gap-2">
			<span class="text-sm">{m.ladderPlayers()}:</span>
			<select
				class="px-2 py-1 bg-surface-200-800 rounded"
				bind:value={playerCount}
				onchange={regenerateLadder}
				disabled={isRunning}
			>
				{#each [2, 3, 4, 5, 6, 7, 8] as count}
					<option value={count}>{count}</option>
				{/each}
			</select>
		</label>
		<label class="flex items-center gap-2 cursor-pointer">
			<input
				type="checkbox"
				bind:checked={excludeSelf}
				onchange={regenerateLadder}
				disabled={isRunning}
				class="w-4 h-4"
			/>
			<span class="text-sm">{m.ladderExcludeSelf()}</span>
		</label>
		<button
			class="px-4 py-2 bg-surface-300-700 hover:bg-surface-400-600 rounded transition-colors disabled:opacity-50"
			onclick={regenerateLadder}
			disabled={isRunning}
		>
			{m.ladderNew()}
		</button>
		<button
			class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors disabled:opacity-50"
			onclick={startAll}
			disabled={isRunning}
		>
			{m.ladderAllStart()}
		</button>
	</div>

	{#if finalResults.size > 0 && !isRunning}
		<div class="flex gap-2 flex-wrap justify-center">
			{#each Array.from(finalResults.entries()) as [player, result]}
				<span
					class="px-2 py-1 rounded text-sm text-white"
					style="background-color: #{colors[player].toString(16).padStart(6, '0')};"
				>
					{player + 1} → {result + 1}
				</span>
			{/each}
		</div>
	{:else}
		<div class="h-8"></div>
	{/if}

	<div bind:this={containerEl} class="rounded-lg overflow-hidden shadow-2xl"></div>
</div>
