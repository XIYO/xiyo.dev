<script>
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages.js';
	import { locales, baseLocale, localizeUrl, deLocalizeUrl } from '$lib/paraglide/runtime';
	import JsonLd from '$lib/JsonLd.svelte';
	import { PUBLIC_SITE_URL } from '$env/static/public';
	import '../app.css';

	const { children } = $props();

	// Effective title/description (prefer page meta, fallback to i18n)
	const effectiveTitle = $derived(page.data.meta?.title ?? m.title());
	const effectiveDescription = $derived(page.data.meta?.description ?? m.description());

    // URL helpers
    const origin = $derived(page.url.origin);
    const pathname = $derived(page.url.pathname);

    // Naver site verification (optional, injected via PUBLIC_NAVER_SITE_VERIFICATION)
    // This will be empty string if not set in .env
    const naverVerification = $derived(import.meta.env.PUBLIC_NAVER_SITE_VERIFICATION || '');

	// Base path without locale using Paraglide runtime
	const basePath = $derived(() => {
		try {
			const baseAbs = deLocalizeUrl(new URL(pathname, origin));
			return baseAbs.pathname || '/';
		} catch {
			return '/';
		}
	});

	/** @param {string} loc */
	const hrefForLocale = (loc) => {
		try {
			const abs = new URL(pathname, origin);
			const baseAbs = deLocalizeUrl(abs);
			return localizeUrl(baseAbs, { locale: loc }).href;
		} catch {
			return origin;
		}
	};

	// OG image default (from meta)
	const ogImage = $derived(page.data.meta?.image ?? '/meta/logo.jpeg');

	// JSON-LD
	/* eslint-disable no-unused-vars */
	const websiteJsonLd = $derived(
		JSON.stringify(
			{
				'@context': 'https://schema.org',
				'@type': 'WebSite',
				name: effectiveTitle,
				url: origin,
				inLanguage: locales
			},
			null,
			0
		)
	);

	const organizationJsonLd = $derived(
		JSON.stringify(
			{
				'@context': 'https://schema.org',
				'@type': 'Organization',
				name: effectiveTitle,
				url: origin,
				logo: ogImage?.startsWith('http') ? ogImage : `${origin}${ogImage}`
			},
			null,
			0
		)
	);

	const isArticle = $derived(!!page.data.postMetadata);
	const articleJsonLd = $derived(() => {
		if (!isArticle) return null;
		const md = page.data.postMetadata?.data ?? {};
		const dates = Array.isArray(md.dates) ? md.dates : [];
		const datePublished = md.published || dates[0] || null;
		const dateModified =
			md.lastModified || md.modified || (dates.length ? dates[dates.length - 1] : null);
		const imgAbs = ogImage?.startsWith('http') ? ogImage : `${origin}${ogImage}`;
		return JSON.stringify(
			{
				'@context': 'https://schema.org',
				'@type': 'BlogPosting',
				headline: md.title || effectiveTitle,
				description: md.description || effectiveDescription,
				mainEntityOfPage: page.url.href,
				image: imgAbs,
				datePublished,
				dateModified: dateModified || datePublished,
				inLanguage: locales,
				keywords: md.keywords || md.tags || [],
				author: md.author ? { '@type': 'Person', name: md.author } : undefined,
				publisher: {
					'@type': 'Organization',
					name: effectiveTitle,
					logo: { '@type': 'ImageObject', url: imgAbs }
				},
				articleSection: md.section || undefined,
				wordCount: page.data.postStats?.wordCount,
				timeRequired: page.data.postStats?.timeRequired
			},
			null,
			0
		);
	});

	const webPageJsonLd = $derived(
		JSON.stringify(
			{
				'@context': 'https://schema.org',
				'@type': 'WebPage',
				name: effectiveTitle,
				description: effectiveDescription,
				url: page.url.href
			},
			null,
			0
		)
	);

	const collectionJsonLd = $derived(() =>
		page.data.category
			? JSON.stringify(
					{
						'@context': 'https://schema.org',
						'@type': 'CollectionPage',
						name: page.data.category.name || effectiveTitle,
						url: page.url.href,
						isPartOf: { '@type': 'WebSite', url: origin }
					},
					null,
					0
				)
			: null
	);

    const itemListJsonLd = $derived(() => {
        if (!page.data.category) return null;
        const listItems = page.data.category.allPosts.slice(0, 50).map(/** @param {any} p @param {number} idx */ (p, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: p.data?.title ?? p.absolutePath.split('/').at(-1),
            item: (() => {
                const path = p.absolutePath?.startsWith('/') ? p.absolutePath : `/${p.absolutePath}`;
                return new URL(path, origin).href;
            })()
        }));
		return JSON.stringify(
			{
				'@context': 'https://schema.org',
				'@type': 'ItemList',
				itemListOrder: 'http://schema.org/ItemListOrderAscending',
				itemListElement: listItems
			},
			null,
			0
		);
	});

    const breadcrumbJsonLd = $derived(() => {
        let bp = '/';
        try {
            const abs = new URL(pathname, origin);
            const baseAbs = deLocalizeUrl(abs);
            bp = baseAbs.pathname || '/';
        } catch {
            // Ignore URL parsing errors
        }
        if (!bp || bp === '/') return null;
        const segments = bp.split('/').filter(Boolean);
        const items = segments.map((seg, idx) => {
            const human = seg.replaceAll('-', ' ');
            const itemUrl =
                origin + (idx === segments.length - 1 ? bp : '/' + segments.slice(0, idx + 1).join('/'));
            const name =
                isArticle && idx === segments.length - 1 && page.data.postMetadata?.data?.title
                    ? page.data.postMetadata.data.title
                    : human;
            return { '@type': 'ListItem', position: idx + 1, name, item: itemUrl };
        });
        /* eslint-enable no-unused-vars */
        return JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: items
        });
    });
</script>

<svelte:head>
	<title>{effectiveTitle}</title>
	<meta content={effectiveDescription} name="description" />
	<link href={PUBLIC_SITE_URL + page.url.pathname} rel="canonical" />

	{#each locales as loc (loc)}
		<link rel="alternate" hreflang={loc} href={hrefForLocale(loc)} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={hrefForLocale(baseLocale)} />
	<link
		rel="alternate"
		type="application/rss+xml"
		title={new URL(PUBLIC_SITE_URL).hostname + ' feed'}
		href={origin + '/feed.xml'}
	/>
	{#if naverVerification}
		<meta name="naver-site-verification" content={naverVerification} />
	{/if}

	<!-- Naver-specific meta tags -->
	<meta name="robots" content="index,follow" />
	<meta name="subject" content={page.data.meta?.subject || 'Development Blog'} />
	<meta name="classification" content={page.data.meta?.classification || 'Technology'} />
	<meta name="publisher" content={page.data.meta?.publisher || new URL(PUBLIC_SITE_URL).hostname} />
	<meta name="author" content={page.data.meta?.author || 'XIYO'} />
	{#if page.data.meta?.keywords}
		<meta name="keywords" content={page.data.meta.keywords} />
	{/if}
	<!-- Cache control for better Naver crawling -->
	<meta http-equiv="cache-control" content="public, max-age=3600" />
	<meta http-equiv="expires" content="3600" />
	<meta property="og:title" content={page.data.meta?.title || effectiveTitle} />
	<meta property="og:description" content={page.data.meta?.description || effectiveDescription} />
	<meta property="og:type" content={page.data.meta?.type || (isArticle ? 'article' : 'website')} />
	<meta property="og:url" content={page.data.meta?.url || page.url.href} />
	<meta property="og:image" content={ogImage?.startsWith('http') ? ogImage : origin + ogImage} />
	<meta property="og:image:alt" content={page.data.meta?.title || effectiveTitle} />
	{#if page.data.meta?.modifiedTime || page.data.meta?.publishedTime}
		<meta
			property="og:updated_time"
			content={page.data.meta?.modifiedTime || page.data.meta?.publishedTime}
		/>
	{/if}
	{#if page.data.meta?.author}
		<meta property="article:author" content={page.data.meta.author} />
	{:else if isArticle}
		<meta property="article:author" content={effectiveTitle} />
	{/if}
	{#if page.data.meta?.publishedTime}
		<meta property="article:published_time" content={page.data.meta.publishedTime} />
	{/if}
	{#if page.data.meta?.modifiedTime}
		<meta property="article:modified_time" content={page.data.meta.modifiedTime} />
	{/if}
	{#if page.data.meta?.section}
		<meta property="article:section" content={page.data.meta.section} />
	{/if}
	{#if page.data.meta?.tags}
		{#each page.data.meta.tags as tag, i (i)}
			<meta property="article:tag" content={tag} />
		{/each}
	{/if}

	<!-- Open Graph site name and locale -->
	<meta property="og:site_name" content={effectiveTitle} />
	<meta
		property="og:locale"
		content={page.url.pathname.startsWith('/en-us')
			? 'en_US'
			: page.url.pathname.startsWith('/ja-jp')
				? 'ja_JP'
				: 'ko_KR'}
	/>
	{#each locales.filter((l) => l !== (page.url.pathname.startsWith('/en-us') ? 'en-us' : page.url.pathname.startsWith('/ja-jp') ? 'ja-jp' : baseLocale)) as alt (alt)}
		<meta
			property="og:locale:alternate"
			content={alt === 'en-us' ? 'en_US' : alt === 'ja-jp' ? 'ja_JP' : 'ko_KR'}
		/>
	{/each}

	<!-- Twitter Cards -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={page.data.meta?.title || effectiveTitle} />
	<meta name="twitter:description" content={page.data.meta?.description || effectiveDescription} />
	<meta name="twitter:image" content={ogImage?.startsWith('http') ? ogImage : origin + ogImage} />

	<!-- JSON-LD: Organization -->
	<JsonLd json={organizationJsonLd} />

	<!-- JSON-LD: WebSite -->
	<JsonLd json={websiteJsonLd} />
	<!-- JSON-LD: BlogPosting (on post pages) -->
	{#if isArticle && articleJsonLd}
		<JsonLd json={articleJsonLd} />
	{/if}

	<!-- JSON-LD: WebPage for non-article pages -->
	{#if !isArticle}
		<JsonLd json={webPageJsonLd} />

		{#if page.data.category}
			{#key page.data.category.absolutePath}
				<!-- JSON-LD: CollectionPage and ItemList for category listings -->
				{#if collectionJsonLd}
					<JsonLd json={collectionJsonLd} />
				{/if}
				{#if itemListJsonLd}
					<JsonLd json={itemListJsonLd} />
				{/if}
			{/key}
		{/if}
	{/if}

	<!-- JSON-LD: BreadcrumbList -->
	{#if basePath && basePath() !== '/'}
		{#key basePath}
			{#if breadcrumbJsonLd}
				<JsonLd json={breadcrumbJsonLd} />
			{/if}
		{/key}
	{/if}
</svelte:head>

{@render children()}
