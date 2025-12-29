<script lang="ts">
	import { datetime } from '$lib/paraglide/registry.js';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import type { PostProps } from '../types/components.js';

	const { postMetadata, postContent }: PostProps = $props();

	const hasDates = $derived(
		postMetadata?.data?.dates && postMetadata.data.dates.length > 0
	);

	const dateFormatOptions: Intl.DateTimeFormatOptions = {
		year: '2-digit',
		month: '2-digit',
		day: '2-digit'
	};

	const firstCommitDate = $derived.by(() => {
		if (!hasDates) return null;
		try {
			const dateStr = postMetadata?.data?.dates?.at(-1);
			return dateStr ? new Date(dateStr) : null;
		} catch {
			return null;
		}
	});

	const lastCommitDate = $derived.by(() => {
		if (!hasDates) return null;
		try {
			const dateStr = postMetadata?.data?.dates?.at(0);
			return dateStr ? new Date(dateStr) : null;
		} catch {
			return null;
		}
	});

	const firstCommitDateString = $derived.by(() => {
		if (!firstCommitDate || isNaN(firstCommitDate.getTime())) return '';
		try {
			return datetime(getLocale(), firstCommitDate, dateFormatOptions);
		} catch {
			return firstCommitDate.toLocaleDateString();
		}
	});

	const lastCommitDateString = $derived.by(() => {
		if (!lastCommitDate || isNaN(lastCommitDate.getTime())) return '';
		try {
			return datetime(getLocale(), lastCommitDate, dateFormatOptions);
		} catch {
			return lastCommitDate.toLocaleDateString();
		}
	});
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
