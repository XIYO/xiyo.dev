import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { redirect } from '@sveltejs/kit';
import { baseLocale, locales, extractLocaleFromRequest } from '$lib/paraglide/runtime';

/**
 * @param {{ event: import('@sveltejs/kit').RequestEvent, resolve: any }} param0
 */
const handleParaglide = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: (/** @type {{ html: string }} */ { html }) =>
				html.replace('%lang%', locale)
		});
	});

/**
 * Handle base locale assets redirect - Base locale URLs don't have locale prefix
 * but assets are stored in /{baseLocale}/posts/.../assets/ directory
 * @param {{ event: import('@sveltejs/kit').RequestEvent, resolve: any }} param0
 */
const handleBaseLocaleAssets = ({ event, resolve }) => {
	const { pathname } = event.url;

	// Check if this is a request for assets that should be redirected to base locale
	if (pathname.includes('/posts/') && pathname.includes('/assets/')) {
		// Get the current locale from the request
		const currentLocale = extractLocaleFromRequest(event.request);

		// Check if path doesn't already include any locale prefix
		const hasLocalePrefix = locales.some((locale) => pathname.startsWith(`/${locale}/`));

		if (!hasLocalePrefix && currentLocale === baseLocale) {
			// Redirect to the base locale version of the asset
			const baseLocaleAssetPath = `/${baseLocale}${pathname}`;
			throw redirect(302, baseLocaleAssetPath);
		}
	}

	return resolve(event);
};

export const handle = sequence(handleBaseLocaleAssets, handleParaglide);
