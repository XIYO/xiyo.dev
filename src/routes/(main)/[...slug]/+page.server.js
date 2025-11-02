import Category from '$lib/post/Category.js';
import Post from '$lib/post/Post.js';
import * as m from '$lib/paraglide/messages.js';
import { parseFrontmatter } from '$lib/post/meta-schema.js';
import { error } from '@sveltejs/kit';
import { PUBLIC_SITE_URL } from '$env/static/public';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
	try {
		const categoryInstance = Category.getCategory(url.pathname);
		const postInstance = Post.getPosts(url.pathname);

		// 포스트도 카테고리도 없으면 404
		if (!categoryInstance && !postInstance) {
			throw error(404, {
				message: 'Page not found',
				path: url.pathname
			});
		}

		const categoryPromise = categoryInstance?.toSerialize(10, 100); // Limit to 100 posts per category for performance

		// 포스트가 있으면 메타데이터와 콘텐츠를 분리해서 가져오기
		const postMetadataPromise = postInstance?.getMetadata();
		const postContentPromise = postInstance?.getContent();

		const [category, postMetadata, postContent] = await Promise.all([
			categoryPromise,
			postMetadataPromise,
			postContentPromise
		]);

		// Safe title and description extraction with fallbacks
		const title = postMetadata?.data?.title || category?.name || m.title();
		const description = postMetadata?.data?.description || m.description();

		// Unified meta construction with schema normalization
		const fm = parseFrontmatter(postMetadata?.data ?? {}, {
			fallbackTitle: m.title(),
			fallbackDescription: m.description()
		});
		// Compute reading stats for articles
		/** @type {{ wordCount?: number, timeRequired?: string } | null } */
		let postStats = null;
		if (postContent?.value && postMetadata?.data) {
			const text = String(postContent.value)
				.replace(/<[^>]+>/g, ' ')
				.replace(/\s+/g, ' ')
				.trim();
			const words = text ? text.split(' ').length : 0;
			const wpm = 200;
			const minutes = Math.max(1, Math.ceil(words / wpm));
			postStats = { wordCount: words, timeRequired: `PT${minutes}M` };
		}

		// Meta construction with schema normalization and Naver SEO
		const meta = postMetadata?.data
			? {
					title: fm.title || m.title(),
					description: fm.description || m.description(),
					keywords: fm.keywords || (fm.tags ? fm.tags.join(', ') : ''),
					type: 'article',
					url: url.href,
					publishedTime: fm.publishedTime,
					modifiedTime: fm.modifiedTime,
					tags: fm.tags,
					image: fm.image,
					author: fm.author || 'XIYO',
					section: fm.section,
					// Naver-specific meta
					subject: 'Development Article',
					classification: 'Technology',
					publisher: new URL(PUBLIC_SITE_URL).hostname,
					robots: 'index, follow',
					cacheControl: 'public, max-age=3600'
				}
			: {
					// Category/list page description auto-summary from top posts
					title: category?.name || m.title(),
					description: (() => {
						const titles = Array.isArray(category?.allPosts)
							? category.allPosts
									.slice(0, 5)
									.map((p) => p?.data?.title || p?.absolutePath?.split('/')?.at(-1))
									.filter(Boolean)
							: [];
						if (!titles.length) return m.description();
						const summary = `Latest posts: ${titles.join(' · ')}`;
						return summary.length > 300 ? summary.slice(0, 297) + '...' : summary;
					})(),
					type: 'website',
					url: url.href,
					image: category ? /** @type {any} */ (category).image || null : null,
					// Naver-specific meta for category pages
					keywords: category?.name
						? `${category.name}, 개발, 프로그래밍, 기술 블로그`
						: '개발, 프로그래밍',
					subject: 'Development Blog',
					classification: 'Technology',
					publisher: new URL(PUBLIC_SITE_URL).hostname,
					robots: 'index, follow',
					cacheControl: 'public, max-age=3600'
				};

		return {
			title,
			description,
			category,
			postMetadata,
			postContent,
			meta,
			postStats
		};
	} catch (err) {
		if (import.meta.env.DEV) {
			console.error(`Error loading page data for ${url.pathname}:`, err);
		}

		// 404 에러는 그대로 전파
		if (err && typeof err === 'object' && 'status' in err && err.status === 404) {
			throw err;
		}

		// 다른 에러는 fallback 반환
		return {
			title: 'Error Loading Page',
			description: 'This page could not be loaded',
			category: null,
			postMetadata: null,
			postContent: null,
			meta: {
				title: 'Error Loading Page',
				description: 'This page could not be loaded',
				type: 'website',
				url: url.href
			}
		};
	}
}

/** @type {import('./$types').EntryGenerator} */
export async function entries() {
	const root = Category.getCategory('');
	if (!root) return [];

	const [allPosts, allCategories] = await Promise.all([
		root.getAllPosts(),
		Promise.resolve(root.allChildCategories)
	]);

	// 포스트 경로들
	const postEntries = allPosts.map((post) => ({
		slug: post.absolutePath.replace(/^\//, '') // 앞의 / 제거
	}));

	// 카테고리 경로들
	const categoryEntries = allCategories.map((cat) => ({
		slug: cat.absolutePath.replace(/^\//, '') // 앞의 / 제거
	}));

	return [...postEntries, ...categoryEntries];
}
