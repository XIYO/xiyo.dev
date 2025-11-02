<script>
	import { datetime } from '$lib/paraglide/registry.js';
	import { getLocale } from '$lib/paraglide/runtime.js';

	/**
	 * @typedef {import('../types/components.js').PostProps} PostProps
	 */

	/** @type {PostProps} */
	const { postMetadata, postContent } = $props();

	// dates가 있을 때만 날짜 표시
	const hasDates = postMetadata?.data?.dates && postMetadata.data.dates.length > 0;

	// Safe date parsing with error handling
	const firstCommitDate = hasDates
		? (() => {
				try {
					const dateStr = postMetadata?.data?.dates?.at(-1);
					return dateStr ? new Date(dateStr) : null;
				} catch (error) {
					if (import.meta.env.DEV) {
						console.warn('Invalid first commit date:', error);
					}
					return null;
				}
			})()
		: null;

	const lastCommitDate = hasDates
		? (() => {
				try {
					const dateStr = postMetadata?.data?.dates?.at(0);
					return dateStr ? new Date(dateStr) : null;
				} catch (error) {
					if (import.meta.env.DEV) {
						console.warn('Invalid last commit date:', error);
					}
					return null;
				}
			})()
		: null;

	/** @type {Intl.DateTimeFormatOptions} */
	const dateFormatOptions = { year: '2-digit', month: '2-digit', day: '2-digit' };

	// Safe date formatting with fallback
	const firstCommitDateString =
		firstCommitDate && !isNaN(firstCommitDate.getTime())
			? (() => {
					try {
						return datetime(getLocale(), firstCommitDate, dateFormatOptions);
					} catch (error) {
						if (import.meta.env.DEV) {
							console.warn('Error formatting first commit date:', error);
						}
						return firstCommitDate.toLocaleDateString();
					}
				})()
			: '';

	const lastCommitDateString =
		lastCommitDate && !isNaN(lastCommitDate.getTime())
			? (() => {
					try {
						return datetime(getLocale(), lastCommitDate, dateFormatOptions);
					} catch (error) {
						if (import.meta.env.DEV) {
							console.warn('Error formatting last commit date:', error);
						}
						return lastCommitDate.toLocaleDateString();
					}
				})()
			: '';
</script>

<main id="post">
	<section class="markdown">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html postContent.value}
	</section>

	{#if hasDates}
		<ul class="bg-primary-500 p-2 text-right text-xs">
			<li>First commit : {firstCommitDateString}</li>
			{#if firstCommitDateString !== lastCommitDateString}
				<li>Last commit : {lastCommitDateString}</li>
			{/if}
		</ul>
	{/if}
</main>
