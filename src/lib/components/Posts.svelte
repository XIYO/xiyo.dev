<script>
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime.js';

	/**
	 * @typedef {import('../types/components.js').PostsProps} PostsProps
	 */

	/** @type {PostsProps} */
	const { category } = $props();
</script>

<main class="markdown">
	<h2>Categories</h2>

	{#if category.childCategories.length}
		<ul class="category-list uppercase">
			{#each category.childCategories as childCategory (childCategory.absolutePath)}
				<li>
					<a class="plain-link" href={localizeHref(childCategory.absolutePath)}>
						{childCategory.name}
						<!-- ({childCategory.allPosts.length}) -->
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p>{m.subCategoryEmpty()}</p>
	{/if}

	<hr class="hr my-12" />

	<h2>Posts</h2>

	<ul class="posts-list">
		{#each category.allPosts as post (post.absolutePath)}
			<li>
				<a class="plain-link" href={localizeHref(post.absolutePath)}>{post.data.title}</a>
			</li>
		{/each}
	</ul>
</main>
