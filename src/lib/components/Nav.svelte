<!-- 언어별 국기 SVG 컴포넌트 선언 -->
<script module>
	export const FlagKo = () =>
		`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60' width='18' height='18'><circle cx='30' cy='30' r='30' fill='#fff'/><circle cx='30' cy='30' r='13' fill='#c60c30'/><path d='M17 17l26 26M43 17L17 43' stroke='#003478' stroke-width='2'/></svg>`;
	export const FlagJa = () =>
		`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60' width='18' height='18'><circle cx='30' cy='30' r='30' fill='#fff'/><circle cx='30' cy='30' r='13' fill='#bc002d'/></svg>`;
	export const FlagEn = () =>
		`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60' width='18' height='18'><circle cx='30' cy='30' r='30' fill='#00247d'/><path d='M0 30h60M30 0v60' stroke='#fff' stroke-width='8'/><path d='M0 0l60 60M60 0L0 60' stroke='#fff' stroke-width='4'/><path d='M0 0l60 60M60 0L0 60' stroke='#cf142b' stroke-width='2'/></svg>`;
</script>

<script>
	import { page } from '$app/state';
	import { deLocalizeHref } from '$lib/paraglide/runtime.js';
	import { locales, localizeHref, setLocale } from '$lib/paraglide/runtime.js';

	const { ...rest } = $props();

	const menuPaths = {
		home: '/',
		posts: '/posts',
		about: '/about',
		glove: '/glove'
	};

	/**
	 * @param {Event} event
	 * @param {string} locale
	 */
	async function handleLocaleClick(event, locale) {
		event.preventDefault();
		setLocale(/** @type {import('$lib/paraglide/runtime.js').Locale} */ (locale));
	}
</script>

<nav class="p-4 uppercase text-2xl font-black tracking-widest" {...rest}>
	<ul class="grid">
		{#each Object.entries(menuPaths) as [key, path] (key)}
			{@const currentPath = deLocalizeHref(page.url.pathname)}
			{@const isCurrentPage = path === '/' ? currentPath === '/' : currentPath.startsWith(path)}
			<li
				class={[`text-center`, { underline: isCurrentPage }]}
				aria-current={isCurrentPage ? 'page' : undefined}
			>
				<a class="p-4 block" href={localizeHref(path)}>{key}</a>
			</li>
		{/each}
	</ul>

	<hr class="my-4" />

	<ul class="grid">
		{#each locales as locale (locale)}
			{#snippet localeItem(/** @type {string} */ locale)}
				<li class="text-right flex items-center gap-2 justify-end">
					{@html locale === 'ko-kr' ? FlagKo() : locale === 'ja-jp' ? FlagJa() : FlagEn()}
					<a
						class="block p-2"
						href={localizeHref(page.url.pathname, { locale })}
						onclick={(e) => handleLocaleClick(e, locale)}
					>
						{locale}
					</a>
				</li>
			{/snippet}
		{/each}
	</ul>
</nav>
