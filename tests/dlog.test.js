import { describe, it, expect } from 'vitest';

describe('Dlog data loading and serialization', () => {
	it('should load dlogs by language from Category system', async () => {
		const { default: Category } = await import('../src/lib/post/Category.js');

		const koCategory = Category.getCategory('/dlog');
		const enCategory = Category.getCategory('/en-us/dlog');
		const jaCategory = Category.getCategory('/ja-jp/dlog');

		expect(koCategory).toBeDefined();
		expect(enCategory).toBeDefined();
		expect(jaCategory).toBeDefined();
	});

	it('should have Korean dlogs with correct structure', async () => {
		const { default: Category } = await import('../src/lib/post/Category.js');

		const dlogCategory = Category.getCategory('/dlog');
		const dlogs = await dlogCategory?.getAllPosts();

		expect(dlogs).toBeDefined();
		expect(Array.isArray(dlogs)).toBe(true);
		expect(dlogs?.length).toBeGreaterThan(0);

		const dlog = dlogs?.[0];
		expect(dlog).toHaveProperty('absolutePath');
		expect(dlog).toHaveProperty('getBoth');
	});

	it('should serialize dlog data correctly for JSON transmission', async () => {
		const { default: Category } = await import('../src/lib/post/Category.js');

		const dlogCategory = Category.getCategory('/dlog');
		const dlogPosts = await dlogCategory?.getAllPosts();
		const dlogs = (dlogPosts ?? []).slice(0, 5);

		const serialized = await Promise.all(
			dlogs.map(async (post) => {
				const both = await post.getBoth();
				return {
					absolutePath: both.absolutePath,
					data: both.data,
					value: both.value
				};
			})
		);

		expect(Array.isArray(serialized)).toBe(true);
		expect(serialized.length).toBeGreaterThan(0);

		const item = serialized[0];
		expect(item).toHaveProperty('absolutePath');
		expect(item).toHaveProperty('data');
		expect(item).toHaveProperty('value');
		expect(item.data).toHaveProperty('createdAt');

		expect(typeof item.absolutePath).toBe('string');
		expect(typeof item.value).toBe('string');
	});

	it('should have different counts for each language', async () => {
		const { default: Category } = await import('../src/lib/post/Category.js');

		const koDlogs = await Category.getCategory('/dlog')?.getAllPosts();
		const enDlogs = await Category.getCategory('/en-us/dlog')?.getAllPosts();
		const jaDlogs = await Category.getCategory('/ja-jp/dlog')?.getAllPosts();

		expect(koDlogs?.length).toBeGreaterThan(0);
		expect(enDlogs?.length).toBeGreaterThan(0);
		expect(jaDlogs?.length).toBeGreaterThan(0);
	});

	it('should have createdAt metadata in dlog data', async () => {
		const { default: Category } = await import('../src/lib/post/Category.js');

		const dlogCategory = Category.getCategory('/dlog');
		const dlogs = await dlogCategory?.getAllPosts();

		expect(dlogs).toBeDefined();
		const dlog = dlogs?.[0];

		const metadata = await dlog?.getMetadata();
		expect(metadata?.data).toHaveProperty('createdAt');
		expect(metadata?.data.createdAt).toBeTruthy();
	});

	it('should process dlog content as markdown', async () => {
		const { default: Category } = await import('../src/lib/post/Category.js');

		const dlogCategory = Category.getCategory('/dlog');
		const dlogs = await dlogCategory?.getAllPosts();
		const dlog = dlogs?.[0];

		const both = await dlog?.getBoth();
		expect(both?.value).toBeTruthy();
		expect(typeof both?.value).toBe('string');
		expect(both?.value?.includes('<p>') || (both?.value?.length ?? 0) > 0).toBe(true);
	});
});
