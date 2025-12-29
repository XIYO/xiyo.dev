import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
// import remarkCallout from '@r4ai/remark-callout';
import remarkFigureCaption from 'remark-figure-caption';
import remarkFrontmatter from 'remark-frontmatter';
import remarkExtractFrontmatter from 'remark-extract-frontmatter';
import remarkRehype from 'remark-rehype';
import rehypeCallouts from 'rehype-callouts';
import rehypeStringify from 'rehype-stringify';
import rehypeMermaid from 'rehype-mermaid';

// 프리렌더 때만 무거운 플러그인을 로드한다.
// 프리렌더가 아니면 가벼운 noop 플러그인을 제공해 .use(...) 체인이 깨지지 않게 한다.
/** @returns {(tree: any) => any} */
const __noop = () => (tree) => tree;

// Top-level await 가능: Vite/SvelteKit ESM, Cloudflare Workers 모두 지원
const rehypeShiki = (await import('@shikijs/rehype')).default;
import { visit } from 'unist-util-visit';
import { load as yamlLoad } from 'js-yaml';

// 성능 최적화: unified 프로세서 캐싱
/** @type {import('unified').Processor<any, any, any, any, any> | null} */
let cachedProcessor = null;

/**
 * @typedef {import('../types/markdown.js').MdastNode} MdastNode
 * @typedef {import('../types/markdown.js').MdastImage} MdastImage
 * @typedef {import('../types/markdown.js').UnifiedPlugin} UnifiedPlugin
 */

/**
 * 이미지 경로에서 /static을 제거하는 remark 플러그인
 * 마크다운에서는 /static/image.png로 작성하지만, 빌드 시 /image.png로 변환됩니다.
 * @returns {UnifiedPlugin}
 */
function remarkStaticImagePath() {
	return (/** @type {MdastNode} */ tree) => {
		visit(tree, 'image', (/** @type {MdastImage} */ node) => {
			if (node.url && node.url.startsWith('/static/')) {
				node.url = node.url.replace('/static/', '/');
			}
		});
	};
}

/**
 * unified 프로세서를 캐시하여 반환합니다.
 * @returns {import('unified').Processor<any, any, any, any, any>}
 */
function getProcessor() {
	// rehype-mermaid 순서 변경으로 인한 캐시 무효화
	if (!cachedProcessor) {
		cachedProcessor = /** @type {import('unified').Processor<any, any, any, any, any>} */ (unified()
			// remark 단계: 마크다운 파싱
			.use(remarkParse, { allowDangerousHtml: true })
			.use(remarkFrontmatter, ['yaml']) // YAML frontmatter 파싱
			.use(remarkExtractFrontmatter, { yaml: yamlLoad }) // yamlLoad 함수를 직접 로더로 전달
			.use(remarkGfm) // GitHub Flavored Markdown 지원 (테이블, 취소선, 작업 목록 등)
			// .use(remarkCallout) // Obsidian 스타일 콜아웃 지원
			.use(remarkFigureCaption)
			.use(remarkStaticImagePath) // 이미지 경로에서 /static 제거

			// rehype 단계: HTML 변환 및 처리
			.use(remarkRehype, { allowDangerousHtml: true })
			.use(
				rehypeMermaid,
				/** @type {any} */ ({
					strategy: 'inline-svg',
					mermaidConfig: {
						theme: 'default',
						themeVariables: {
							fontFamily: 'inherit'
						}
					},
					// GitHub Actions 환경을 위한 명시적 브라우저 설정
					browser: process.env.CI ? 'chromium' : undefined,
					launchOptions: process.env.CI
						? {
								headless: true,
								args: ['--no-sandbox', '--disable-setuid-sandbox']
							}
						: undefined
				})
			)
			.use(rehypeShiki, rehypeShikiOptions)
			.use(rehypeCallouts, {
				theme: 'obsidian' // Obsidian 테마 사용
			})

			// stringify 단계: 최종 HTML 생성
			.use(rehypeStringify, { allowDangerousHtml: true }));
	}
	return cachedProcessor;
}

/**
 * 마크다운을 HTML로 변환하고 메타데이터를 추출합니다.
 *
 * 캐시 전략:
 * ✅ unified 프로세서: 한 번 생성 후 재사용 (플러그인 체인 초기화 비용 절약)
 * ❌ 처리 결과: 매번 다른 마크다운이므로 캐시 불가
 *
 * @param {{ markdown: string }} options
 * @returns {Promise<import('../types/markdown.js').ProcessedMarkdown>}
 */
export default async function markdownAsync({ markdown }) {
	// ✅ 캐시된 프로세서 재사용: rehypeShiki 초기화 등 비싼 작업 절약
	const processor = getProcessor();

	// ❌ 매번 새로운 마크다운 처리: 캐시 불가능
	const result = await processor.process(markdown);

	return {
		value: String(result.value),
		data: result.data
	};
}

/**
 * @type {import('@shikijs/rehype').RehypeShikiOptions}
 * Shiki 옵션: 라이트/다크 모드 모두 Dracula 테마 사용
 */
const rehypeShikiOptions = {
	themes: {
		light: 'night-owl',
		dark: 'night-owl'
	}
};

/**
 * 캐시된 프로세서를 정리합니다. (테스트나 메모리 정리용)
 */
export function clearProcessorCache() {
	cachedProcessor = null;
}

// 개발 모드에서 핫 리로드 시 캐시 지우기
if (import.meta.hot) {
	import.meta.hot.accept(() => {
		clearProcessorCache();
	});
}
