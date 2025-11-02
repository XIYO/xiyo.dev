import Category from '$lib/post/Category.js';
import { PUBLIC_SITE_URL } from '$env/static/public';

/**
 * Generate RSS 2.0 feed for recent posts (base locale prioritized)
 * @type {import('./$types').RequestHandler}
 */
export async function GET() {
	try {
		// Gather recent posts from the root category
		const root = Category.getCategory('');
		const all = await root?.getAllPosts();
		const recent = (all ?? []).slice(0, 100);

		const items = await Promise.all(
			recent.map(async (post) => {
				const md = await post.getMetadata();
				const data = md?.data ?? {};
				const title = data.title || 'Untitled';
				const link = PUBLIC_SITE_URL + localizedPath(post.absolutePath);
				const description = data.description || '';
				const pub = data.createdAt || data.dates?.[0] || new Date(0).toISOString();
				return { title, link, description, pubDate: new Date(pub).toUTCString() };
			})
		);

		const rss = buildRss({
			title: `${new URL(PUBLIC_SITE_URL).hostname} feed`,
			link: PUBLIC_SITE_URL,
			description: `Recent posts from ${new URL(PUBLIC_SITE_URL).hostname}`,
			items
		});

		return new Response(rss, {
			headers: {
				'Content-Type': 'application/rss+xml; charset=utf-8',
				'Cache-Control': 'public, max-age=600'
			}
		});
	} catch (e) {
		if (import.meta.env.DEV) {
			console.error('RSS build error', e);
		}
		return new Response('RSS error', { status: 500 });
	}
}

/** @param {string} absPath */
function localizedPath(absPath) {
	// Base locale has no prefix, others have /<locale>
	// Prefer base locale link if available in locales set
	// Posts are stored de-localized in absolutePath
	return absPath.startsWith('/') ? absPath : `/${absPath}`;
}

/** @param {string} str */
function escapeXml(str) {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/** @param {{ title: string, link: string, description: string, items: any[] }} param0 */
function buildRss({ title, link, description, items }) {
	const entries = items
		.map(
			(i) => `
    <item>
      <title>${escapeXml(i.title)}</title>
      <link>${escapeXml(i.link)}</link>
      <guid>${escapeXml(i.link)}</guid>
      <pubDate>${i.pubDate}</pubDate>
      <description><![CDATA[${i.description}]]></description>
    </item>`
		)
		.join('');

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(link)}</link>
    <description>${escapeXml(description)}</description>
    <language>ko-KR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
    ${entries}
  </channel>
</rss>`;
}

export const prerender = true;
