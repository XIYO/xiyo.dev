import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
export default {
	compilerOptions: {
		runes: true  // 모든 컴포넌트에서 runes 강제 활성화
	},
	kit: {
		adapter: adapter({
			// Deploy as a Cloudflare Worker
			// routes are handled by the worker; static in /static is served by the worker
		}),
		prerender: {
			crawl: false, // 자동 크롤링 비활성화 - entries 함수로 명시적 제어
			handleMissingId: 'warn',
			handleHttpError: ({ status, path, referrer }) => {
				// 404는 정상 동작 (존재하지 않는 페이지)
				if (status === 404) return;

				// 다른 에러는 경고
				console.warn(`${status} error on ${path}${referrer ? ` (referrer: ${referrer})` : ''}`);
			},
			entries: [
				'/',
				'/feed.xml',
				'/rss.xml',
				'/sitemap.xml',
				'/glove',
				'/games',
				'/games/tic-tac-toe',
				'/nav'
			] // entries 함수가 있는 라우트에서 동적으로 생성
		}
	}
};
