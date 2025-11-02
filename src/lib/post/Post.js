import markdownProcessAsync from '$lib/plugin/markdown.js';
import { deLocalizeHref } from '$lib/paraglide/runtime.js';

/**
 * @typedef {import('../types/markdown.js').ProcessedMarkdown} ProcessedMarkdown
 * @typedef {import('../types/markdown.js').PostData} PostData
 * @typedef {import('../types/markdown.js').PostContent} PostContent
 * @typedef {import('../types/markdown.js').PostWithContent} PostWithContent
 */

/**
 * 게시글(Post) 클래스
 */
export default class Post {
	/** @type {Map<string, Post>} */
	static #posts = new Map();
	/** @type {() => Promise<string>} */
	#markdownAsync;
	/** @type {string} */
	#absolutePath;
	/** @type {Promise<ProcessedMarkdown> | null} */
	#processedMarkdownCache = null;
	/** @type {PostData | null} */
	#metadata = null;
	/** @type {WeakRef<{content: string}> | {deref: () => {content: string}} | null} */
	#rawMarkdownCache = null;

	/**
	 * Post 클래스의 생성자입니다.
	 * @param {{ absolutePath: string, markdownAsync: () => Promise<string> }} param0
	 */
	constructor({ absolutePath, markdownAsync }) {
		Post.#posts.set(absolutePath, this);
		this.#absolutePath = deLocalizeHref(absolutePath);
		this.#markdownAsync = markdownAsync;
	}

	/**
	 * 절대 경로로 포스트를 반환합니다.
	 * @param {string} absolutePath 절대 경로
	 * @returns {Post | undefined} Post 인스턴스 또는 undefined
	 */
	static getPosts(absolutePath) {
		return Post.#posts.get(absolutePath) ?? Post.#posts.get(deLocalizeHref(absolutePath));
	}

	/**
	 * 포스트의 절대 경로 반환
	 * @returns {string}
	 */
	get absolutePath() {
		return this.#absolutePath;
	}

	/**
	 * 포스트의 정렬 날짜 반환 (동기)
	 * @returns {Date}
	 */
	get sortDate() {
		// 메타데이터가 아직 로드되지 않았으면 기본값
		if (!this.#metadata) {
			return new Date(0);
		}

		// createdAt 필드가 있으면 우선 사용
		if (this.#metadata?.data?.createdAt) {
			return new Date(this.#metadata.data.createdAt);
		}
		// dates 배열의 첫 번째 값을 createdAt로 사용
		if (this.#metadata?.data?.dates?.length > 0 && this.#metadata.data.dates[0]) {
			return new Date(this.#metadata.data.dates[0]);
		}
		// 날짜가 없으면 기본값
		return new Date(0);
	}

	/**
	 * 포스트의 data 속성 반환 (하위 호환성)
	 * @returns {Promise<any>}
	 */
	get data() {
		return this.getMetadata().then((meta) => meta.data);
	}

	/**
	 * 마크다운 원본을 캐시하고 반환합니다.
	 * @returns {Promise<string>}
	 */
	async #getRawMarkdown() {
		// WeakRef를 사용해 메모리 압박 시 GC 허용
		let cachedMarkdown = this.#rawMarkdownCache?.deref();
		if (cachedMarkdown) {
			return cachedMarkdown.content;
		}

		const markdownContent = await this.#markdownAsync();
		if (!markdownContent || typeof markdownContent !== 'string') {
			throw new Error(`Invalid markdown content for ${this.#absolutePath}`);
		}

		// WeakRef는 객체만 참조 가능하므로 문자열을 객체로 감싸서 캐시
		try {
			this.#rawMarkdownCache = new WeakRef({ content: markdownContent });
		} catch {
			// WeakRef가 지원되지 않는 환경에서는 일반 캐시 사용
			this.#rawMarkdownCache = { deref: () => ({ content: markdownContent }) };
		}
		return markdownContent;
	}

	/**
	 * 마크다운을 처리하고 캐시합니다.
	 * @returns {Promise<ProcessedMarkdown>}
	 */
	async #getProcessedMarkdown() {
		if (!this.#processedMarkdownCache) {
			try {
				const markdownContent = await this.#getRawMarkdown();
				this.#processedMarkdownCache = markdownProcessAsync({
					markdown: markdownContent
				});
			} catch (error) {
				if (import.meta.env.DEV) {
					console.error(`Error processing markdown for ${this.#absolutePath}:`, error);
				}
				// Return a fallback processed markdown
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				this.#processedMarkdownCache = Promise.resolve({
					value: `<div class="error">Error loading content: ${errorMessage}</div>`,
					data: {
						title: 'Error',
						description: 'Content could not be loaded',
						dates: [],
						tags: [],
						keywords: []
					}
				});
			}
		}
		return this.#processedMarkdownCache;
	}

	/**
	 * 포스트의 메타데이터만 반환합니다.
	 * @returns {Promise<PostData>}
	 */
	async getMetadata() {
		try {
			const processed = await this.#getProcessedMarkdown();
			this.#metadata = {
				absolutePath: this.#absolutePath,
				data: processed.data
			};
			return this.#metadata;
		} catch (error) {
			if (import.meta.env.DEV) {
				console.error(`Error getting metadata for ${this.#absolutePath}:`, error);
			}
			const fallbackMetadata = {
				absolutePath: this.#absolutePath,
				data: {
					title: 'Error Loading Post',
					description: 'This post could not be loaded',
					dates: [],
					tags: [],
					keywords: []
				}
			};
			this.#metadata = fallbackMetadata;
			return fallbackMetadata;
		}
	}

	/**
	 * 포스트의 콘텐츠(HTML)만 반환합니다.
	 * @returns {Promise<PostContent>}
	 */
	async getContent() {
		try {
			const processed = await this.#getProcessedMarkdown();
			return {
				absolutePath: this.#absolutePath,
				value: processed.value
			};
		} catch (error) {
			if (import.meta.env.DEV) {
				console.error(`Error getting content for ${this.#absolutePath}:`, error);
			}
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			return {
				absolutePath: this.#absolutePath,
				value: `<div class="error">Error loading content: ${errorMessage}</div>`
			};
		}
	}

	/**
	 * 포스트의 메타데이터와 콘텐츠를 모두 반환합니다.
	 * @returns {Promise<PostWithContent>}
	 */
	async getBoth() {
		try {
			const processed = await this.#getProcessedMarkdown();
			return {
				absolutePath: this.#absolutePath,
				data: processed.data,
				value: processed.value
			};
		} catch (error) {
			if (import.meta.env.DEV) {
				console.error(`Error getting both metadata and content for ${this.#absolutePath}:`, error);
			}
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			return {
				absolutePath: this.#absolutePath,
				data: {
					title: 'Error Loading Post',
					description: 'This post could not be loaded',
					dates: [],
					tags: [],
					keywords: []
				},
				value: `<div class="error">Error loading content: ${errorMessage}</div>`
			};
		}
	}

	/**
	 * 포스트를 직렬화하여 반환합니다. (하위 호환성을 위해)
	 * @returns {Promise<PostWithContent>}
	 */
	async toSerialize() {
		return this.getBoth();
	}

	/**
	 * 캐시를 정리합니다. (메모리 최적화)
	 */
	clearCache() {
		this.#processedMarkdownCache = null;
		this.#rawMarkdownCache = null;
		this.#metadata = null;
	}

	/**
	 * 정적 메서드: 모든 포스트의 캐시를 정리
	 */
	static clearAllCaches() {
		for (const post of this.#posts.values()) {
			post.clearCache();
		}
	}
}
