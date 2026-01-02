import { describe, expect, test } from 'vitest';
import {
	generateDerangement,
	generateLadder,
	traceLadderPath,
	computeAllResults,
	isValidDerangement,
	hasNoAdjacentRungs
} from '$lib/services/ladder';
import type { LadderData } from '$lib/services/ladder';

describe('generateDerangement', () => {
	test('returns array of correct length', () => {
		for (let n = 2; n <= 8; n++) {
			const result = generateDerangement(n);
			expect(result).toHaveLength(n);
		}
	});

	test('no element is in its original position', () => {
		for (let i = 0; i < 100; i++) {
			for (let n = 2; n <= 8; n++) {
				const result = generateDerangement(n);
				expect(isValidDerangement(result)).toBe(true);
			}
		}
	});

	test('contains all original elements', () => {
		const result = generateDerangement(5);
		const expected = [0, 1, 2, 3, 4];
		expect([...result].sort((a, b) => a - b)).toEqual(expected);
	});
});

describe('generateLadder', () => {
	test('generates correct rowCount for playerCount without excludeSelf', () => {
		expect(generateLadder({ playerCount: 2, excludeSelf: false }).rowCount).toBe(12);
		expect(generateLadder({ playerCount: 3, excludeSelf: false }).rowCount).toBe(12);
		expect(generateLadder({ playerCount: 4, excludeSelf: false }).rowCount).toBe(16);
		expect(generateLadder({ playerCount: 5, excludeSelf: false }).rowCount).toBe(20);
	});

	test('generates correct rowCount for playerCount with excludeSelf', () => {
		expect(generateLadder({ playerCount: 2, excludeSelf: true }).rowCount).toBe(12);
		expect(generateLadder({ playerCount: 3, excludeSelf: true }).rowCount).toBe(12);
		expect(generateLadder({ playerCount: 4, excludeSelf: true }).rowCount).toBe(16);
		expect(generateLadder({ playerCount: 5, excludeSelf: true }).rowCount).toBe(25);
	});

	test('minimum rowCount is 12', () => {
		const ladder = generateLadder({ playerCount: 2, excludeSelf: false });
		expect(ladder.rowCount).toBeGreaterThanOrEqual(12);
	});

	test('rungs array has correct dimensions', () => {
		const ladder = generateLadder({ playerCount: 4, excludeSelf: false });
		expect(ladder.rungs).toHaveLength(ladder.rowCount);
		ladder.rungs.forEach((row) => {
			expect(row).toHaveLength(3);
		});
	});

	test('excludeSelf ladder produces derangement through structure', () => {
		for (let i = 0; i < 50; i++) {
			for (let playerCount = 2; playerCount <= 6; playerCount++) {
				const ladder = generateLadder({ playerCount, excludeSelf: true });
				const results = computeAllResults(ladder, playerCount);
				expect(isValidDerangement(results)).toBe(true);
			}
		}
	});

	test('without excludeSelf results can include self-mapping', () => {
		let foundSelfMapping = false;
		for (let i = 0; i < 100 && !foundSelfMapping; i++) {
			const ladder = generateLadder({ playerCount: 4, excludeSelf: false });
			const results = computeAllResults(ladder, 4);
			if (results.some((val, idx) => val === idx)) {
				foundSelfMapping = true;
			}
		}
		expect(foundSelfMapping).toBe(true);
	});
});

describe('traceLadderPath', () => {
	const cellWidth = 60;
	const cellHeight = 28;
	const startY = 40;
	const playerCount = 4;

	test('path starts at correct position', () => {
		const ladder = generateLadder({ playerCount, excludeSelf: false });
		const trace = traceLadderPath(ladder, 0, playerCount, cellWidth, cellHeight, startY);
		expect(trace.path[0].x).toBe(80);
		expect(trace.path[0].y).toBe(startY);
	});

	test('path ends at correct y position', () => {
		const ladder = generateLadder({ playerCount, excludeSelf: false });
		const trace = traceLadderPath(ladder, 0, playerCount, cellWidth, cellHeight, startY);
		const lastPoint = trace.path[trace.path.length - 1];
		const expectedY = ladder.rowCount * cellHeight + startY;
		expect(lastPoint.y).toBe(expectedY);
	});

	test('finalColumn is within bounds', () => {
		const ladder = generateLadder({ playerCount, excludeSelf: false });
		for (let col = 0; col < playerCount; col++) {
			const trace = traceLadderPath(ladder, col, playerCount, cellWidth, cellHeight, startY);
			expect(trace.finalColumn).toBeGreaterThanOrEqual(0);
			expect(trace.finalColumn).toBeLessThan(playerCount);
		}
	});

	test('path only moves horizontally or vertically', () => {
		const ladder = generateLadder({ playerCount, excludeSelf: false });
		const trace = traceLadderPath(ladder, 1, playerCount, cellWidth, cellHeight, startY);

		for (let i = 1; i < trace.path.length; i++) {
			const prev = trace.path[i - 1];
			const curr = trace.path[i];
			const isHorizontal = prev.y === curr.y && prev.x !== curr.x;
			const isVertical = prev.x === curr.x && prev.y !== curr.y;
			expect(isHorizontal || isVertical).toBe(true);
		}
	});
});

describe('computeAllResults', () => {
	test('returns permutation of all columns', () => {
		const ladder = generateLadder({ playerCount: 4, excludeSelf: false });
		const results = computeAllResults(ladder, 4);
		expect(results).toHaveLength(4);
		expect([...results].sort((a, b) => a - b)).toEqual([0, 1, 2, 3]);
	});

	test('each starting column maps to unique ending column', () => {
		for (let i = 0; i < 20; i++) {
			const ladder = generateLadder({ playerCount: 5, excludeSelf: false });
			const results = computeAllResults(ladder, 5);
			const uniqueResults = new Set(results);
			expect(uniqueResults.size).toBe(5);
		}
	});
});

describe('isValidDerangement', () => {
	test('returns true for valid derangement', () => {
		expect(isValidDerangement([1, 0])).toBe(true);
		expect(isValidDerangement([1, 2, 0])).toBe(true);
		expect(isValidDerangement([1, 0, 3, 2])).toBe(true);
	});

	test('returns false for invalid derangement', () => {
		expect(isValidDerangement([0, 1])).toBe(false);
		expect(isValidDerangement([1, 1, 2])).toBe(false);
		expect(isValidDerangement([0, 2, 1])).toBe(false);
	});
});

describe('hasNoAdjacentRungs', () => {
	test('returns true when no adjacent rungs', () => {
		expect(hasNoAdjacentRungs([[true, false, true]])).toBe(true);
		expect(hasNoAdjacentRungs([[false, true, false]])).toBe(true);
		expect(hasNoAdjacentRungs([[false, false, false]])).toBe(true);
	});

	test('returns false when adjacent rungs exist', () => {
		expect(hasNoAdjacentRungs([[true, true, false]])).toBe(false);
		expect(hasNoAdjacentRungs([[false, true, true]])).toBe(false);
	});
});
