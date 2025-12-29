<script lang="ts">
	import confetti from 'canvas-confetti';

	type Player = 'X' | 'O';
	type Cell = Player | null;

	const WINNING_LINES = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6]
	] as const;

	let board = $state<Cell[]>(Array(9).fill(null));
	let currentPlayer = $state<Player>('X');
	let scores = $state({ X: 0, O: 0 });
	let lastWinner = $state<Player | null>(null);

	const winner = $derived.by(() => {
		for (const [a, b, c] of WINNING_LINES) {
			if (board[a] && board[a] === board[b] && board[a] === board[c]) {
				return board[a];
			}
		}
		return null;
	});

	$effect(() => {
		if (winner && winner !== lastWinner) {
			lastWinner = winner;
			celebrate();
		}
	});

	function celebrate() {
		const duration = 2000;
		const end = Date.now() + duration;

		const frame = () => {
			confetti({
				particleCount: 3,
				angle: 60,
				spread: 55,
				origin: { x: 0, y: 0.8 }
			});
			confetti({
				particleCount: 3,
				angle: 120,
				spread: 55,
				origin: { x: 1, y: 0.8 }
			});

			if (Date.now() < end) {
				requestAnimationFrame(frame);
			}
		};

		frame();
	}

	const winningLine = $derived.by(() => {
		for (const line of WINNING_LINES) {
			const [a, b, c] = line;
			if (board[a] && board[a] === board[b] && board[a] === board[c]) {
				return line;
			}
		}
		return null;
	});

	const isDraw = $derived(!winner && board.every((cell) => cell !== null));
	const isGameOver = $derived(winner !== null || isDraw);

	const status = $derived.by(() => {
		if (winner) return `Winner: ${winner}`;
		if (isDraw) return 'Draw!';
		return `Turn: ${currentPlayer}`;
	});

	function handleClick(index: number) {
		if (board[index] || isGameOver) return;

		board[index] = currentPlayer;

		if (!winner) {
			currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
		} else {
			scores[winner]++;
		}
	}

	function resetGame() {
		board = Array(9).fill(null);
		currentPlayer = 'X';
		lastWinner = null;
	}

	function resetAll() {
		resetGame();
		scores = { X: 0, O: 0 };
	}

	function isWinningCell(index: number) {
		return winningLine ? (winningLine as readonly number[]).includes(index) : false;
	}
</script>

<div class="flex flex-col items-center gap-6">
	<div class="flex gap-8 text-lg font-mono">
		<span class="text-blue-500">X: {scores.X}</span>
		<span class="text-red-500">O: {scores.O}</span>
	</div>

	<p class="text-xl font-semibold h-8">{status}</p>

	<div class="grid grid-cols-3 gap-1 bg-surface-300-700 p-1 rounded">
		{#each board as cell, index}
			<button
				class="w-20 h-20 text-4xl font-bold bg-surface-100-900 transition-colors
					   hover:bg-surface-200-800 disabled:cursor-not-allowed
					   {isWinningCell(index) ? 'bg-green-500/30' : ''}
					   {cell === 'X' ? 'text-blue-500' : 'text-red-500'}"
				onclick={() => handleClick(index)}
				disabled={cell !== null || isGameOver}
				aria-label="Cell {index + 1}"
			>
				{cell ?? ''}
			</button>
		{/each}
	</div>

	<div class="flex gap-4">
		<button
			class="px-4 py-2 bg-surface-300-700 hover:bg-surface-400-600 rounded transition-colors"
			onclick={resetGame}
		>
			New Game
		</button>
		<button
			class="px-4 py-2 bg-surface-300-700 hover:bg-surface-400-600 rounded transition-colors"
			onclick={resetAll}
		>
			Reset Score
		</button>
	</div>
</div>
