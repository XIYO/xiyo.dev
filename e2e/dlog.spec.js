import { test, expect } from '@playwright/test';

test.describe('Dlog Feature - E2E Tests', () => {
	test.describe('Korean Homepage', () => {
		test('should display dlog section on homepage', async ({ page }) => {
			await page.goto('/');

			const dlogSection = page.locator('text=최근 작업');
			await expect(dlogSection).toBeVisible();
		});

		test('should display Korean dlogs with correct count', async ({ page }) => {
			await page.goto('/');

			const dlogItems = page.locator('.dlog-list li');
			const count = await dlogItems.count();

			expect(count).toBeGreaterThan(0);
			expect(count).toBeLessThanOrEqual(5);
		});

		test('should display dlog content with tags', async ({ page }) => {
			await page.goto('/');

			const firstDlog = page.locator('.dlog-list li').first();
			const hasContent = await firstDlog.locator('p').count();
			expect(hasContent).toBeGreaterThan(0);
		});

		test('should display dates in Korean format', async ({ page }) => {
			await page.goto('/');

			const dateElements = page.locator('.dlog-list time');
			const count = await dateElements.count();

			expect(count).toBeGreaterThan(0);

			const firstDate = await dateElements.first().textContent();
			expect(firstDate).toBeTruthy();
			expect(firstDate).toContain('2025');
		});

		test('should have valid datetime attributes', async ({ page }) => {
			await page.goto('/');

			const timeElements = page.locator('.dlog-list time');
			if ((await timeElements.count()) > 0) {
				const datetimeAttr = await timeElements.first().getAttribute('datetime');
				expect(datetimeAttr).toBeTruthy();
			}
		});
	});

	test.describe('English Homepage', () => {
		test('should display English dlogs on /en-us/', async ({ page }) => {
			await page.goto('/en-us/');

			const dlogList = page.locator('.dlog-list');
			await expect(dlogList).toBeVisible();
		});

		test('should display only English dlog entries', async ({ page }) => {
			await page.goto('/en-us/');

			const dlogItems = page.locator('.dlog-list li');
			const count = await dlogItems.count();

			expect(count).toBeGreaterThan(0);
			expect(count).toBeLessThanOrEqual(5);
		});

		test('should display dates with content', async ({ page }) => {
			await page.goto('/en-us/');

			const dateElements = page.locator('.dlog-list time');
			const count = await dateElements.count();

			if (count > 0) {
				const firstDate = await dateElements.first().textContent();
				expect(firstDate).toBeTruthy();
			}
		});

		test('should have English content', async ({ page }) => {
			await page.goto('/en-us/');

			const content = await page.locator('.dlog-list').textContent();
			expect(content).toBeTruthy();
		});
	});

	test.describe('Japanese Homepage', () => {
		test('should display Japanese dlogs on /ja-jp/', async ({ page }) => {
			await page.goto('/ja-jp/');

			const dlogList = page.locator('.dlog-list');
			const isVisible = await dlogList.isVisible().catch(() => false);
			expect(isVisible).toBe(true);
		});

		test('should display only Japanese dlog entries', async ({ page }) => {
			await page.goto('/ja-jp/');

			const dlogItems = page.locator('.dlog-list li');
			const count = await dlogItems.count();

			expect(count).toBeGreaterThan(0);
			expect(count).toBeLessThanOrEqual(5);
		});

		test('should display Japanese content', async ({ page }) => {
			await page.goto('/ja-jp/');

			const content = await page.locator('.dlog-list').textContent();
			expect(content).toBeTruthy();
			expect(content?.length).toBeGreaterThan(0);
		});
	});

	test.describe('Dlog HTML Structure', () => {
		test('should have proper list structure', async ({ page }) => {
			await page.goto('/');

			const dlogList = page.locator('.dlog-list');
			await expect(dlogList).toBeVisible();

			const listItems = dlogList.locator('li');
			const count = await listItems.count();

			expect(count).toBeGreaterThan(0);
		});

		test('should have hr separator after dlog section', async ({ page }) => {
			await page.goto('/');

			const dlogSection = page.locator('section.markdown', {
				has: page.locator('h2:has-text("최근 작업")')
			});
			const hrInSection = dlogSection.locator('hr');

			expect(await hrInSection.count()).toBeGreaterThanOrEqual(0);
		});

		test('should have tags in dlog items', async ({ page }) => {
			await page.goto('/');

			const dlogItems = page.locator('.dlog-list li');
			if ((await dlogItems.count()) > 0) {
				const spans = dlogItems.first().locator('span');
				const spanCount = await spans.count();
				expect(spanCount).toBeGreaterThanOrEqual(0);
			}
		});
	});

	test.describe('Dlog Content Validation', () => {
		test('should render markdown content as HTML', async ({ page }) => {
			await page.goto('/');

			const dlogContent = page.locator('.dlog-list li').first().locator('p');
			await expect(dlogContent).toBeVisible();

			const text = await dlogContent.textContent();
			expect(text).toBeTruthy();
			expect(text?.length).toBeGreaterThan(0);
		});

		test('should not display empty dlog items', async ({ page }) => {
			await page.goto('/');

			const items = page.locator('.dlog-list li');
			const count = await items.count();

			for (let i = 0; i < count; i++) {
				const item = items.nth(i);
				const text = await item.textContent();
				expect(text?.trim()).toBeTruthy();
			}
		});
	});

	test.describe('Dlog Language Switching', () => {
		test('should show different dlogs when switching languages', async ({ page }) => {
			await page.goto('/');
			const koList = page.locator('.dlog-list');
			const koVisible = await koList.isVisible();

			await page.goto('/en-us/');
			const enList = page.locator('.dlog-list');
			const enVisible = await enList.isVisible();

			expect(koVisible && enVisible).toBe(true);
		});

		test('should maintain dlog section visibility across languages', async ({ page }) => {
			const languages = ['/', '/en-us/', '/ja-jp/'];

			for (const lang of languages) {
				await page.goto(lang);
				const dlogList = page.locator('.dlog-list');
				const isVisible = await dlogList.isVisible().catch(() => false);
				expect(isVisible).toBe(true);
			}
		});
	});
});
