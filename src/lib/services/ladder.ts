export interface LadderConfig {
	playerCount: number;
	excludeSelf: boolean;
}

export interface LadderData {
	rungs: boolean[][];
	rowCount: number;
}

export interface PathPoint {
	x: number;
	y: number;
}

export interface TraceResult {
	path: PathPoint[];
	finalColumn: number;
}

export function generateDerangement(n: number): number[] {
	const arr = Array.from({ length: n }, (_, i) => i);

	for (let i = n - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * i);
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}

	return arr;
}

export function generateRandomPermutation(n: number): number[] {
	const arr = Array.from({ length: n }, (_, i) => i);
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

function swapAdjacent(perm: number[], pos: number) {
	[perm[pos], perm[pos + 1]] = [perm[pos + 1], perm[pos]];
}

function simulatePermutation(rungs: boolean[][], n: number): number[] {
	const result: number[] = [];
	for (let start = 0; start < n; start++) {
		let col = start;
		for (let row = 0; row < rungs.length; row++) {
			if (col > 0 && rungs[row][col - 1]) {
				col--;
			} else if (col < n - 1 && rungs[row][col]) {
				col++;
			}
		}
		result.push(col);
	}
	return result;
}

function permutationToRungs(targetPerm: number[], rowCount: number): boolean[][] {
	const n = targetPerm.length;
	const maxCorrectionSwaps = (n * (n - 1)) / 2;
	const correctionReserve = maxCorrectionSwaps + 2;
	const chaosRows = Math.max(Math.floor(rowCount * 0.5), rowCount - correctionReserve);

	const rungs: boolean[][] = Array.from({ length: rowCount }, () =>
		Array(n - 1).fill(false)
	);

	for (let row = 0; row < chaosRows; row++) {
		for (let col = 0; col < n - 1; col++) {
			const prevHasRung = col > 0 && rungs[row][col - 1];
			if (!prevHasRung && Math.random() > 0.4) {
				rungs[row][col] = true;
			}
		}
	}

	const currentPerm = simulatePermutation(rungs.slice(0, chaosRows), n);

	const currentInverse: number[] = Array(n).fill(0);
	for (let i = 0; i < n; i++) {
		currentInverse[currentPerm[i]] = i;
	}

	const correction: number[] = Array(n).fill(0);
	for (let i = 0; i < n; i++) {
		correction[i] = targetPerm[currentInverse[i]];
	}

	const correctionInverse: number[] = Array(n).fill(0);
	for (let i = 0; i < n; i++) {
		correctionInverse[correction[i]] = i;
	}

	const correctionSwaps: number[] = [];
	const state = Array.from({ length: n }, (_, i) => i);

	for (let i = 0; i < n; i++) {
		let pos = state.indexOf(correctionInverse[i]);
		while (pos > i) {
			[state[pos], state[pos - 1]] = [state[pos - 1], state[pos]];
			correctionSwaps.push(pos - 1);
			pos--;
		}
	}

	let correctionRow = chaosRows;
	for (const swapPos of correctionSwaps) {
		if (correctionRow >= rowCount) break;
		rungs[correctionRow][swapPos] = true;
		correctionRow++;
	}

	for (let row = correctionRow; row < rowCount - 1; row += 2) {
		const col = Math.floor(Math.random() * (n - 1));
		const prevHasRung = col > 0 && rungs[row][col - 1];
		const nextHasRung = col < n - 2 && rungs[row][col + 1];
		if (!prevHasRung && !nextHasRung) {
			rungs[row][col] = true;
			if (row + 1 < rowCount) {
				rungs[row + 1][col] = true;
			}
		}
	}

	return rungs;
}

export function generateLadder(config: LadderConfig): LadderData {
	const { playerCount, excludeSelf } = config;
	const rowCount = excludeSelf ? Math.max(12, playerCount * playerCount) : Math.max(12, playerCount * 4);

	let rungs: boolean[][];

	if (excludeSelf) {
		const targetPerm = generateDerangement(playerCount);
		rungs = permutationToRungs(targetPerm, rowCount);
	} else {
		rungs = [];
		for (let row = 0; row < rowCount; row++) {
			const rowRungs: boolean[] = [];
			for (let col = 0; col < playerCount - 1; col++) {
				const prevHasRung = col > 0 && rowRungs[col - 1];
				rowRungs.push(!prevHasRung && Math.random() > 0.4);
			}
			rungs.push(rowRungs);
		}
	}

	return { rungs, rowCount };
}

export function traceLadderPath(
	ladder: LadderData,
	startCol: number,
	playerCount: number,
	cellWidth: number,
	cellHeight: number,
	startY: number
): TraceResult {
	const { rungs, rowCount } = ladder;

	const getX = (col: number) => col * cellWidth + cellWidth / 2 + 50;
	const getY = (row: number) => row * cellHeight + startY + cellHeight / 2;

	let col = startCol;
	const path: PathPoint[] = [{ x: getX(col), y: startY }];

	for (let row = 0; row < rowCount; row++) {
		const y = getY(row);
		path.push({ x: getX(col), y });

		if (col > 0 && rungs[row][col - 1]) {
			path.push({ x: getX(col - 1), y });
			col--;
		} else if (col < playerCount - 1 && rungs[row][col]) {
			path.push({ x: getX(col + 1), y });
			col++;
		}
	}

	const finalY = rowCount * cellHeight + startY;
	path.push({ x: getX(col), y: finalY });

	return { path, finalColumn: col };
}

export function computeAllResults(ladder: LadderData, playerCount: number): number[] {
	const results: number[] = [];
	for (let i = 0; i < playerCount; i++) {
		const trace = traceLadderPath(ladder, i, playerCount, 1, 1, 0);
		results.push(trace.finalColumn);
	}
	return results;
}

export function isValidDerangement(results: number[]): boolean {
	return results.every((val, idx) => val !== idx);
}

export function hasNoAdjacentRungs(rungs: boolean[][]): boolean {
	return rungs.every((row) => {
		for (let i = 1; i < row.length; i++) {
			if (row[i] && row[i - 1]) return false;
		}
		return true;
	});
}
