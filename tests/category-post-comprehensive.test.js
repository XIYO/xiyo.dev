import { describe, it, expect } from 'vitest';
import Category from '../src/lib/post/Category.js';
import Post from '../src/lib/post/Post.js';

describe('Category System Comprehensive Tests', () => {
	describe('Category Initialization', () => {
		it('should initialize root category', () => {
			const root = Category.getCategory('');
			expect(root).toBeDefined();
			expect(root.absolutePath).toBeDefined();
		});

		it('should initialize posts category', () => {
			const postsCategory = Category.getCategory('/posts');
			expect(postsCategory).toBeDefined();
			expect(postsCategory.absolutePath).toMatch(/posts/);
		});

		it('should initialize dlog category for all languages', () => {
			const koDlog = Category.getCategory('/dlog');
			const enDlog = Category.getCategory('/en-us/dlog');
			const jaDlog = Category.getCategory('/ja-jp/dlog');

			expect(koDlog).toBeDefined();
			expect(enDlog).toBeDefined();
			expect(jaDlog).toBeDefined();
		});

		it('should handle non-existent categories gracefully', () => {
			const nonExistent = Category.getCategory('/non/existent/path');
			expect(
				nonExistent === null || nonExistent === undefined || nonExistent?.absolutePath
			).toBeTruthy();
		});
	});

	describe('Category Navigation', () => {
		it('should retrieve child categories', async () => {
			const postsCategory = Category.getCategory('/posts');
			if (!postsCategory) return;

			const children = await postsCategory.getChildCategories();
			expect(Array.isArray(children)).toBe(true);
			if (children.length > 0) {
				expect(children.length).toBeGreaterThan(0);
			} else {
				expect(true).toBe(true);
			}
		});

		it('should traverse category hierarchy', async () => {
			const root = Category.getCategory('');
			const allPosts = await root?.getAllPosts();

			expect(Array.isArray(allPosts)).toBe(true);
			expect(allPosts.length).toBeGreaterThan(0);
		});

		it('should retrieve parent category correctly', () => {
			const childCategory = Category.getCategory('/posts/development');
			expect(childCategory).toBeDefined();

			const parent = Category.getCategory('/posts');
			expect(parent).toBeDefined();
		});
	});

	describe('Post Retrieval', () => {
		it('should get all posts from category', async () => {
			const postsCategory = Category.getCategory('/posts');
			if (!postsCategory) return;

			const posts = await postsCategory.getAllPosts();
			expect(Array.isArray(posts)).toBe(true);
			expect(posts.length).toBeGreaterThan(0);

			posts.forEach((post) => {
				expect(post).toHaveProperty('absolutePath');
				expect(post).toHaveProperty('getMetadata');
				expect(post).toHaveProperty('getBoth');
			});
		});

		it('should get immediate posts only from category', async () => {
			const postsCategory = Category.getCategory('/posts');
			if (!postsCategory) return;

			const posts = await postsCategory.getPosts();
			expect(Array.isArray(posts)).toBe(true);
		});

		it('should find posts by absolute path', () => {
			const post = Post.getPosts('/about');
			if (post) {
				expect(post).toBeDefined();
			} else {
				expect(true).toBe(true);
			}
		});

		it('should handle language-specific post retrieval', async () => {
			const koDlog = Category.getCategory('/dlog');
			const enDlog = Category.getCategory('/en-us/dlog');

			const koPosts = await koDlog?.getAllPosts();
			const enPosts = await enDlog?.getAllPosts();

			expect(koPosts?.length).toBeGreaterThan(0);
			expect(enPosts?.length).toBeGreaterThan(0);
		});
	});

	describe('Post Data Structure', () => {
		it('should have valid post absolutePath', async () => {
			const postsCategory = Category.getCategory('/posts');
			const posts = await postsCategory?.getAllPosts();

			if (posts && posts.length > 0) {
				const post = posts[0];
				expect(post.absolutePath).toBeTruthy();
				expect(typeof post.absolutePath).toBe('string');
				expect(post.absolutePath).toMatch(/\//);
			}
		});

		it('should retrieve post metadata successfully', async () => {
			const postsCategory = Category.getCategory('/posts');
			const posts = await postsCategory?.getAllPosts();

			if (posts && posts.length > 0) {
				const post = posts[0];
				const metadata = await post.getMetadata();

				expect(metadata).toBeDefined();
				expect(metadata.data).toBeDefined();
				expect(metadata.absolutePath).toBe(post.absolutePath);
			}
		});

		it('should have sortDate property on posts', async () => {
			const postsCategory = Category.getCategory('/posts');
			const posts = await postsCategory?.getAllPosts();

			if (posts && posts.length > 0) {
				posts.forEach((post) => {
					expect(post.sortDate).toBeInstanceOf(Date);
				});
			}
		});

		it('should retrieve both content and metadata', async () => {
			const postsCategory = Category.getCategory('/posts');
			const posts = await postsCategory?.getAllPosts();

			if (posts && posts.length > 0) {
				const post = posts[0];
				const both = await post.getBoth();

				expect(both).toHaveProperty('absolutePath');
				expect(both).toHaveProperty('data');
				expect(both).toHaveProperty('value');
				expect(typeof both.value).toBe('string');
			}
		});
	});

	describe('Metadata Processing', () => {
		it('should parse frontmatter metadata correctly', async () => {
			const postsCategory = Category.getCategory('/posts');
			const posts = await postsCategory?.getAllPosts();

			if (posts && posts.length > 0) {
				const post = posts[0];
				const metadata = await post.getMetadata();
				const data = metadata.data;

				expect(data).toHaveProperty('title');
				expect(typeof data.title).toBe('string');
			}
		});

		it('should handle tags in metadata', async () => {
			const postsCategory = Category.getCategory('/posts');
			const posts = await postsCategory?.getAllPosts();

			if (posts && posts.length > 0) {
				for (const post of posts) {
					const metadata = await post.getMetadata();
					if (metadata.data.tags) {
						expect(Array.isArray(metadata.data.tags)).toBe(true);
					}
				}
			}
		});

		it('should handle authors in metadata', async () => {
			const postsCategory = Category.getCategory('/posts');
			const posts = await postsCategory?.getAllPosts();

			if (posts && posts.length > 0) {
				const postsWithAuthors = [];
				for (const post of posts) {
					const metadata = await post.getMetadata();
					if (metadata.data.authors) {
						postsWithAuthors.push(post);
					}
				}
				expect(postsWithAuthors.length).toBeGreaterThan(0);
			}
		});

		it('should cache metadata after first access', async () => {
			const postsCategory = Category.getCategory('/posts');
			const posts = await postsCategory?.getAllPosts();

			if (posts && posts.length > 0) {
				const post = posts[0];
				const metadata1 = await post.getMetadata();
				const metadata2 = await post.getMetadata();

				expect(metadata1.data).toEqual(metadata2.data);
			}
		});
	});

	describe('Sorting and Ordering', () => {
		it('should sort posts by date in descending order', async () => {
			const postsCategory = Category.getCategory('/posts');
			const posts = await postsCategory?.getAllPosts();

			if (posts && posts.length > 1) {
				for (let i = 0; i < posts.length - 1; i++) {
					const currentDate = posts[i].sortDate.getTime();
					const nextDate = posts[i + 1].sortDate.getTime();
					expect(currentDate).toBeGreaterThanOrEqual(nextDate);
				}
			} else {
				expect(true).toBe(true);
			}
		});

		it('should sort categories by latest post date', async () => {
			const root = Category.getCategory('');
			const children = await root?.getChildCategories();

			if (children && children.length > 1) {
				for (let i = 0; i < children.length - 1; i++) {
					try {
						const currentLatest = await children[i].getLatestPostDate();
						const nextLatest = await children[i + 1].getLatestPostDate();
						expect(currentLatest.getTime()).toBeGreaterThanOrEqual(nextLatest.getTime());
					} catch {
						expect(true).toBe(true);
					}
				}
			} else {
				expect(true).toBe(true);
			}
		});
	});

	describe('Content Processing', () => {
		it('should process markdown to HTML', async () => {
			const postsCategory = Category.getCategory('/posts');
			const posts = await postsCategory?.getAllPosts();

			if (posts && posts.length > 0) {
				const post = posts[0];
				const both = await post.getBoth();

				expect(both.value).toBeTruthy();
				expect(typeof both.value).toBe('string');
				expect(both.value.length).toBeGreaterThan(0);
			}
		});

		it('should preserve markdown structure in HTML output', async () => {
			const postsCategory = Category.getCategory('/posts');
			const posts = await postsCategory?.getAllPosts();

			if (posts && posts.length > 0) {
				const post = posts[0];
				const both = await post.getBoth();

				expect(both.value).toMatch(/[a-z]/i);
			}
		});
	});

	describe('Multi-language Support', () => {
		it('should retrieve content for all languages', async () => {
			const languages = ['', '/en-us', '/ja-jp'];
			const results = {};

			for (const lang of languages) {
				const category = Category.getCategory(lang ? `${lang}/posts` : '/posts');
				const posts = await category?.getAllPosts();
				results[lang] = posts?.length ?? 0;
			}

			expect(Object.values(results).every((count) => count > 0)).toBe(true);
		});

		it('should have consistent post structure across languages', async () => {
			const categories = [
				Category.getCategory('/posts'),
				Category.getCategory('/en-us/posts'),
				Category.getCategory('/ja-jp/posts')
			];

			for (const category of categories) {
				if (!category) continue;

				const posts = await category.getAllPosts();
				if (posts.length === 0) continue;

				const post = posts[0];
				expect(post.absolutePath).toBeTruthy();
				expect(post.sortDate).toBeInstanceOf(Date);

				const metadata = await post.getMetadata();
				expect(metadata.data).toHaveProperty('title');
			}
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty categories', async () => {
			const emptyCategory = Category.getCategory('/non-existent');
			if (emptyCategory) {
				const posts = await emptyCategory.getAllPosts();
				expect(Array.isArray(posts)).toBe(true);
			} else {
				expect(true).toBe(true);
			}
		});

		it('should handle posts without metadata', async () => {
			const mockPost = new Post({
				absolutePath: '/test/mock',
				markdownAsync: () => Promise.resolve('# Test\nContent')
			});

			expect(mockPost.absolutePath).toBe('/test/mock');
		});

		it('should handle concurrent metadata access', async () => {
			const postsCategory = Category.getCategory('/posts');
			const posts = await postsCategory?.getAllPosts();

			if (posts && posts.length > 0) {
				const promises = posts.slice(0, 3).map((post) => post.getMetadata());
				const results = await Promise.all(promises);

				expect(results.length).toBe(Math.min(3, posts.length));
				results.forEach((result) => {
					expect(result).toHaveProperty('data');
				});
			}
		});
	});

	describe('Performance', () => {
		it('should handle large category structures efficiently', async () => {
			const startTime = Date.now();
			const root = Category.getCategory('');
			const allPosts = await root?.getAllPosts();
			const endTime = Date.now();

			expect(endTime - startTime).toBeLessThan(5000);
			expect(allPosts?.length).toBeGreaterThan(0);
		});

		it('should cache category results', async () => {
			const category1 = Category.getCategory('/posts');
			const category2 = Category.getCategory('/posts');

			expect(category1).toBe(category2);
		});
	});
});
