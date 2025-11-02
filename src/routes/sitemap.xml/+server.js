import { locales, baseLocale } from '$lib/paraglide/runtime';
import { localizeUrl, deLocalizeUrl } from '$lib/paraglide/runtime.js';
import { dev } from '$app/environment';
import Category from '$lib/post/Category.js';
import { PUBLIC_SITE_URL } from '$env/static/public';

/**
 * Generate sitemap.xml dynamically
 * @type {import('./$types').RequestHandler}
 */
export async function GET() {
	try {
		const urls = await generateAllUrls();
		const sitemap = generateSitemapXml(urls);

		return new Response(sitemap, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': dev ? 'no-cache' : 'public, max-age=3600'
			}
		});
	} catch (error) {
		if (import.meta.env.DEV) {
			console.error('사이트맵 생성 오류:', error);
		}
		return new Response('사이트맵 생성에 실패했습니다', { status: 500 });
	}
}

/**
 * Prerender this route
 */
export const prerender = true;

/**
 * Generate all URLs for sitemap using Category system (optimized)
 */
async function generateAllUrls() {
	const urls = new Set();

	// 홈페이지 추가
	for (const locale of locales) {
		if (locale === baseLocale) {
			urls.add({
				url: '/',
				priority: 1.0,
				changefreq: 'daily',
				lastmod: new Date().toISOString().split('T')[0]
			});
		} else {
			urls.add({
				url: `/${locale}/`,
				priority: 1.0,
				changefreq: 'daily',
				lastmod: new Date().toISOString().split('T')[0]
			});
		}
	}

	// 루트 카테고리에서 모든 포스트와 카테고리 가져오기 (성능 최적화)
	const root = Category.getCategory('');
	if (!root) return Array.from(urls);

	const [allPosts, allCategories] = await Promise.all([
		root.getAllPosts(),
		Promise.resolve(root.allChildCategories)
	]);

	// 모든 포스트의 메타데이터를 병렬로 미리 로드 (성능 최적화)
	await Promise.all(allPosts.map((post) => post.getMetadata()));

	// 모든 카테고리의 최신 날짜를 병렬로 미리 로드 (성능 최적화)
	await Promise.all(allCategories.map((category) => category.getLatestPostDate()));

	// 각 언어별 URL 생성
	for (const locale of locales) {
		// 포스트 URL 추가
		for (const post of allPosts) {
			const metadata = await post.getMetadata(); // 이미 캐시됨
			const postPath = post.absolutePath;
			const postUrl = locale === baseLocale ? postPath : `/${locale}${postPath}`;

			// 메타데이터에서 수정일 가져오기
			const lastmod = getLastModifiedFromMetadata(metadata);

			urls.add({
				url: postUrl,
				priority: getPriority(postUrl),
				changefreq: getChangeFreq(postUrl),
				lastmod: lastmod
			});
		}

		// 카테고리 URL 추가
		for (const category of allCategories) {
			const categoryPath = category.absolutePath;
			const categoryUrl = locale === baseLocale ? categoryPath : `/${locale}${categoryPath}`;

			// 카테고리의 최신 포스트 날짜 가져오기 (이미 캐시됨)
			const latestDate = await category.getLatestPostDate();

			urls.add({
				url: categoryUrl,
				priority: getPriority(categoryUrl),
				changefreq: getChangeFreq(categoryUrl),
				lastmod: latestDate.toISOString().split('T')[0]
			});
		}
	}

	return Array.from(urls);
}

/**
 * Get last modified date from post metadata
 * @param {any} metadata - Post metadata
 * @returns {string} ISO date string
 */
function getLastModifiedFromMetadata(metadata) {
	if (!metadata?.data) {
		return new Date().toISOString().split('T')[0];
	}

	const data = metadata.data;

	// 1순위: modifiedAt 필드
	if (data.modifiedAt) {
		return new Date(data.modifiedAt).toISOString().split('T')[0];
	}

	// 2순위: dates 배열의 마지막 날짜
	if (data.dates && Array.isArray(data.dates) && data.dates.length > 0) {
		const lastDate = data.dates[data.dates.length - 1];
		return new Date(lastDate).toISOString().split('T')[0];
	}

	// 기본값: 현재 날짜
	return new Date().toISOString().split('T')[0];
}

/**
 * Get URL priority
 */
function getPriority(url) {
	// 홈페이지 = 최고 우선순위
	if (url === '/' || url.match(/^\/(en-us|ja-jp)\/?$/)) {
		return 1.0;
	}

	// 메인 카테고리 (/posts, /posts/development 등)
	if (url.match(/^(\/[^/]+)?\/posts\/?$/) || url.match(/^(\/[^/]+)?\/posts\/[^/]+\/?$/)) {
		return 0.8;
	}

	// 서브 카테고리
	if (url.match(/^(\/[^/]+)?\/posts\/[^/]+\/[^/]+\/?$/) && !url.includes('.')) {
		return 0.6;
	}

	// 개별 포스트
	return 0.5;
}

/**
 * Get change frequency
 */
function getChangeFreq(url) {
	// 홈페이지 = 매일
	if (url === '/' || url.match(/^\/(en-us|ja-jp)\/?$/)) {
		return 'daily';
	}

	// 메인 카테고리 = 주간
	if (url.match(/^(\/[^/]+)?\/posts\/?$/) || url.match(/^(\/[^/]+)?\/posts\/[^/]+\/?$/)) {
		return 'weekly';
	}

	// 개별 포스트, 서브카테고리 = 월간
	return 'monthly';
}

/**
 * Generate sitemap XML
 */
// legacy helpers removed: using paraglide localizeUrl/deLocalizeUrl instead

function buildAlternateLinks(url) {
	const abs = new URL(PUBLIC_SITE_URL + url);
	const baseAbs = deLocalizeUrl(abs);
	const links = locales
		.map((loc) => {
			const locUrl = localizeUrl(baseAbs, { locale: loc });
			return `\n    <xhtml:link rel="alternate" hreflang="${loc}" href="${locUrl.href}"/>`;
		})
		.join('');
	const xDefaultUrl = localizeUrl(baseAbs, { locale: baseLocale });
	const xDefault = `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultUrl.href}"/>`;
	return links + xDefault;
}

function generateSitemapXml(urls) {
	const urlEntries = urls
		.map(
			/** @param {{ url: string, priority: number, changefreq: string, lastmod: string }} param0 */ ({
				url,
				priority,
				changefreq,
				lastmod
			}) => `
  <url>
    <loc>${PUBLIC_SITE_URL}${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${buildAlternateLinks(url)}
  </url>`
		)
		.join('');

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;
}
