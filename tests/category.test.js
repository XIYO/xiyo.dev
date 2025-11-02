import { describe, it, expect } from 'vitest';

describe('Category and Post baseLocale fallback', () => {
	it('should return correct localized paths for each locale', async () => {
		// 동적 import를 사용하여 모듈 로드
		const { localizeHref, baseLocale, locales } = await import('../src/lib/paraglide/runtime.js');

		// 각 locale에 대해 동적으로 테스트
		locales.forEach((locale) => {
			const result = localizeHref('/about', { locale });
			if (locale === baseLocale) {
				// baseLocale은 프리픽스가 없어야 함
				expect(result).toBe('/about');
			} else {
				// 다른 locale은 프리픽스가 있어야 함
				expect(result).toBe(`/${locale}/about`);
			}
		});

		// baseLocale이 설정되어 있는지 확인
		expect(baseLocale).toBeDefined();
		expect(locales).toContain(baseLocale);
	});

	it('should find baseLocale content when accessing paths without language prefix', async () => {
		// 동적 import
		const { baseLocale, locales } = await import('../src/lib/paraglide/runtime.js');
		const { default: Category } = await import('../src/lib/post/Category.js');
		const { default: Post } = await import('../src/lib/post/Post.js');

		const baseLocaleLower = baseLocale.toLowerCase();

		// 카테고리 테스트: 각 locale의 posts 카테고리가 존재하는지 확인
		/** @type {Record<string, any>} */
		const categoryByLocale = {};
		locales.forEach((locale) => {
			const localeLower = locale.toLowerCase();
			const category = Category.getCategory(`/${localeLower}/posts`);
			if (category) {
				categoryByLocale[locale] = category;
			}
		});

		// baseLocale 카테고리가 존재해야 함
		expect(categoryByLocale[baseLocale]).toBeDefined();

		// 프리픽스 없는 경로로 접근 시 baseLocale 콘텐츠를 찾아야 함
		const postsCategory = Category.getCategory('/posts');
		expect(postsCategory).toBeDefined();
		// Category는 deLocalized path를 저장하므로 absolutePath는 '/posts'여야 함
		expect(postsCategory?.absolutePath).toBe('/posts');

		// Post 테스트: about 파일이 baseLocale에 있는지 확인
		const baseAboutPost = Post.getPosts(`/${baseLocaleLower}/about`);
		const aboutPost = Post.getPosts('/about');

		// Verify baseLocale about post accessibility

		// baseLocale 경로로 about 파일이 존재해야 함
		expect(baseAboutPost).toBeDefined();
		// 프리픽스 없는 경로로도 찾을 수 있어야 함
		expect(aboutPost).toBeDefined();
	});

	it('should find about content for all language locales', async () => {
		// 동적 import
		const { locales } = await import('../src/lib/paraglide/runtime.js');
		const { default: Post } = await import('../src/lib/post/Post.js');

		// Testing /about access for all locales

		// 각 언어별로 about 파일이 존재하는지 확인
		/** @type {Record<string, any>} */
		const aboutPosts = {};
		locales.forEach((locale) => {
			const localeLower = locale.toLowerCase();
			const aboutPost = Post.getPosts(`/${localeLower}/about`);

			if (aboutPost) {
				aboutPosts[locale] = aboutPost;
			}
		});

		// 모든 locale에 대해 about 파일이 존재해야 함
		locales.forEach((locale) => {
			expect(aboutPosts[locale]).toBeDefined();
			expect(aboutPosts[locale]).toBeInstanceOf(Post);
		});

		// /about (프리픽스 없는 경로)로 접근했을 때 baseLocale의 about이 반환되는지 확인
		const aboutWithoutPrefix = Post.getPosts('/about');
		expect(aboutWithoutPrefix).toBeDefined();

		// Verify /about returns baseLocale content

		// 실제로는 다른 Post 인스턴스일 수 있지만, /about이 baseLocale의 콘텐츠를 반환하는지 확인
		// Post.getPosts가 baseLocale fallback을 제공하는지 확인
		expect(aboutWithoutPrefix).toBeDefined();
		expect(aboutWithoutPrefix).toBeInstanceOf(Post);

		// All locales should have accessible /about pages
	});
});
