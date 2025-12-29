import Category from '$lib/post/Category.js';
import * as m from '$lib/paraglide/messages.js';

export const prerender = true;

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const origin = url.origin;
	const root = Category.getCategory('');
	const allPosts = await root?.getAllPosts();
	const posts = (allPosts ?? []).slice(0, 50); // Recent 50 posts

	const title = m.title();
	const description = m.description();
	const now = new Date().toUTCString();

	// Pre-fetch all post metadata
	const postItems = await Promise.all(
		posts.map(async (post) => {
			const metadata = await post.getMetadata();
			const path = post.absolutePath?.startsWith('/') ? post.absolutePath : '/' + post.absolutePath;
			return {
				path,
				data: metadata.data
			};
		})
	);

	// Generate RSS XML
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${origin}</link>
    <description>${escapeXml(description)}</description>
    <language>ko</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml"/>
    <generator>SvelteKit</generator>
    <webMaster>xiyo.dev@gmail.com (XIYO)</webMaster>
    <managingEditor>xiyo.dev@gmail.com (XIYO)</managingEditor>
    <copyright>Copyright ${new Date().getFullYear()} XIYO</copyright>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <ttl>60</ttl>
${postItems
	.map((item) => {
		const postUrl = origin + item.path;
		const postTitle = item.data?.title || item.path.split('/').pop()?.replace(/-/g, ' ') || 'Untitled';
		const postDescription = item.data?.description || item.data?.messages?.[0] || '';
		const postDate = new Date(
			item.data?.modified || item.data?.created || Date.now()
		).toUTCString();
		const postAuthor = item.data?.author || 'XIYO';
		/** @type {string[]} */
		const categories = item.data?.tags || [];

		return `    <item>
      <title>${escapeXml(postTitle)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(postDescription)}</description>
      <pubDate>${postDate}</pubDate>
      <dc:creator>${escapeXml(postAuthor)}</dc:creator>
      ${categories.map((cat) => `<category>${escapeXml(cat)}</category>`).join('\n      ')}
    </item>`;
	})
	.join('\n')}
  </channel>
</rss>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}

/**
 * @param {string | null | undefined} unsafe
 */
function escapeXml(unsafe) {
	if (!unsafe) return '';
	return String(unsafe).replace(/[<>&'"]/g, (c) => {
		switch (c) {
			case '<':
				return '&lt;';
			case '>':
				return '&gt;';
			case '&':
				return '&amp;';
			case "'":
				return '&apos;';
			case '"':
				return '&quot;';
			default:
				return c;
		}
	});
}
