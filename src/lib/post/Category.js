import Post from '$lib/post/Post.js';
import { deLocalizeHref } from '$lib/paraglide/runtime.js';

/**
 * @typedef {import('../types/markdown.js').SerializedCategory} SerializedCategory
 * @typedef {import('../types/markdown.js').PostData} PostData
 */

/**
 * 카테고리(Category) 클래스
 */
export default class Category {
	/** @type {Map<string, Category>} */
	static #categories = new Map();
	static #root;
	/** @type {string} */
	#absolutePath;
	/** @type {Map<string, Category>} */
	#childCategories = new Map();
	/** @type {Map<string, import('./Post.js').default>} */
	#posts = new Map();

	static {
		this.#root = new Category('');

		const markdowns = import.meta.glob('/static/**/*.md', { query: '?raw', import: 'default' });

		Object.entries(markdowns).forEach(([path, markdownAsync]) => {
			let absolutePath = path
				.replace(/^\/static/, '') // 스태틱 경로 제거
				.replace(/\.md$/, ''); // 확장자 제거

			this.#initCategories({
				absolutePath,
				markdownAsync: /** @type {() => Promise<string>} */ (markdownAsync)
			});
		});
	}

	/**
	 * 카테고리 생성자
	 * @param {string} absolutePath 접근 가능한 절대 경로
	 */
	constructor(absolutePath) {
		Category.#categories.set(absolutePath, this);
		this.#absolutePath = deLocalizeHref(absolutePath);
	}

	/**
	 * 카테고리명 반환
	 * @returns {string}
	 */
	get name() {
		return this.#absolutePath.split('/').at(-1) || '';
	}

	/**
	 * 카테고리 절대 경로 반환
	 * @returns {string}
	 */
	get absolutePath() {
		return this.#absolutePath;
	}

	/**
	 * 모든 하위 카테고리 반환
	 * @returns {Category[]}
	 */
	get allChildCategories() {
		let allChildCategories = [];
		for (const childCategory of this.#childCategories.values()) {
			allChildCategories.push(childCategory);
			allChildCategories.push(...childCategory.allChildCategories);
		}
		return allChildCategories;
	}

	/**
	 * 자식 카테고리 목록 반환 (최신 포스트 순으로 정렬)
	 * @returns {Promise<Category[]>}
	 */
	async getChildCategories() {
		const categories = [...this.#childCategories.values()];

		// 각 카테고리의 최신 포스트 날짜를 위해 메타데이터 로드
		const categoriesWithDates = await Promise.all(
			categories.map(async (category) => ({
				category,
				latestDate: await category.getLatestPostDate()
			}))
		);

		// 최신 포스트 날짜순으로 정렬
		categoriesWithDates.sort((a, b) => {
			return b.latestDate.getTime() - a.latestDate.getTime();
		});

		return categoriesWithDates.map((item) => item.category);
	}

	/**
	 * 포스트 배열을 정렬 날짜 기준 내림차순으로 정렬 (최신순)
	 * @param {import('./Post.js').default[]} posts - 정렬할 포스트 배열
	 * @returns {import('./Post.js').default[]} 정렬된 포스트 배열
	 * @private
	 */
	static #sortPostsByDate(posts) {
		return posts.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
	}

	/**
	 * 자신의 포스트 목록 반환 (최신순으로 정렬)
	 * @returns {Promise<import('./Post.js').default[]>}
	 */
	async getPosts() {
		const posts = [...this.#posts.values()];

		// 각 포스트의 메타데이터를 로드하여 정확한 정렬 날짜 확보
		await Promise.all(posts.map((post) => post.getMetadata()));

		// published 또는 dates[0] 기준으로 정렬
		return Category.#sortPostsByDate(posts);
	}

	/**
	 * 카테고리의 가장 최신 포스트 날짜 (비동기)
	 * @returns {Promise<Date>}
	 */
	async getLatestPostDate() {
		const allPosts = await this.getAllPosts();
		if (allPosts.length === 0) return new Date(0);

		// 모든 포스트의 날짜 중 가장 최신 날짜 반환 (이미 정렬되어 있으므로 첫 번째 포스트 사용)
		return allPosts[0].sortDate;
	}

	/**
	 * 자신과 하위 카테고리의 포스트 반환 (최신순으로 정렬)
	 * @returns {Promise<import('./Post.js').default[]>}
	 */
	async getAllPosts() {
		// 현재 카테고리의 포스트들
		const currentPosts = [...this.#posts.values()];

		// 모든 하위 카테고리의 포스트들을 병렬로 가져오기 (성능 최적화)
		const childPostsArrays = await Promise.all(
			[...this.#childCategories.values()].map((childCategory) => childCategory.getAllPosts())
		);
		const childPosts = childPostsArrays.flat();

		const allPosts = [...currentPosts, ...childPosts];

		// 메타데이터 로드 후 정렬
		await Promise.all(allPosts.map((post) => post.getMetadata()));

		return Category.#sortPostsByDate(allPosts);
	}

	/**
	 * 대체 언어가 없는 경우, 원본을 반환 합니다
	 * @param {string} absolutePath
	 * @returns {Category | undefined}
	 */
	static getCategory(absolutePath) {
		return this.#categories.get(absolutePath) ?? this.#categories.get(deLocalizeHref(absolutePath));
	}

	/**
	 * 정적 메서드: 모든 카테고리의 캐시를 정리
	 */
	static async clearAllCaches() {
		// 루트 카테고리에서 시작하여 모든 포스트 캐시 정리
		if (this.#root) {
			const allPosts = await this.#root.getAllPosts();
			for (const post of allPosts) {
				post.clearCache();
			}
		}
	}

	static #initCategories(
		/** @type {{ absolutePath: string, markdownAsync: () => Promise<string> }} */ {
			absolutePath,
			markdownAsync
		},
		/** @type {{ category?: Category, index?: number }} */ { category = this.#root, index = 0 } = {}
	) {
		const splitPath = absolutePath.split('/');
		const absolutePaths = splitPath;
		const categoryAbsolutePath = splitPath.slice(0, index + 1).join('/');

		if (absolutePaths.length > index + 1) {
			if (!this.#categories.has(categoryAbsolutePath))
				category.addChildCategory(new Category(categoryAbsolutePath));
			const targetCategory = this.#categories.get(categoryAbsolutePath);

			this.#initCategories(
				{ absolutePath, markdownAsync },
				{ category: targetCategory, index: index + 1 }
			);
		} else {
			const post = new Post({ absolutePath, markdownAsync });
			category.addPost(post);
		}
	}

	/**
	 * 카테고리 추가
	 * @param {Category} category
	 */
	addChildCategory(category) {
		this.#childCategories.set(category.#absolutePath, category);
	}

	/**
	 * 포스트 추가
	 * @param {import('./Post.js').default} post 추가할 포스트
	 */
	addPost(post) {
		this.#posts.set(post.absolutePath, post);
	}

	/**
	 * 카테고리 직렬화 (성능 최적화)
	 * @param {number} [maxDepth] - 최대 직렬화 깊이 (무한 순환 방지)
	 * @param {number} [maxPosts] - 최대 포스트 개수 (성능 최적화), undefined면 모든 포스트
	 * @returns {Promise<SerializedCategory>}
	 */
	async toSerialize(maxDepth = 10, maxPosts = undefined) {
		if (maxDepth <= 0) {
			// 깊이 제한 달성 시 기본 데이터만 반환
			return {
				name: this.name,
				absolutePath: this.#absolutePath,
				childCategories: [],
				allPosts: []
			};
		}

		// 메타데이터가 로드된 정렬된 데이터 사용
		const [allPosts, sortedChildCategories] = await Promise.all([
			// 메타데이터 로드 후 정렬된 포스트들
			this.getAllPosts(),
			// 메타데이터 로드 후 정렬된 자식 카테고리들
			this.getChildCategories()
		]);

		// 포스트 개수 제한 적용 (성능 최적화)
		const postsToSerialize = maxPosts ? allPosts.slice(0, maxPosts) : allPosts;

		// 포스트 메타데이터 추출 (이미 로드됨)
		const posts = await Promise.all(postsToSerialize.map((post) => post.getMetadata()));

		// 자식 카테고리 직렬화 (동일한 maxPosts 제한 전달)
		const childCategories = await Promise.all(
			sortedChildCategories.map((category) => category.toSerialize(maxDepth - 1, maxPosts))
		);

		// 메모리 효율적 방식으로 필터링
		const filteredPosts = posts.map((post) => ({
			absolutePath: post.absolutePath,
			data: post.data
		}));

		return {
			name: this.name,
			absolutePath: this.#absolutePath,
			childCategories,
			allPosts: filteredPosts
		};
	}
}
