<script>
	const { dlog, lang = 'ko' } = $props();
</script>

<li>
	<div>
		<div>
			{@html dlog.value}
		</div>
		<div class="text-xs text-gray-500 mt-2">
			{#if dlog.data.tags && dlog.data.tags.length > 0}
				<span class="mr-2">
					{#each dlog.data.tags as tag}
						#{tag}{' '}
					{/each}
				</span>
			{/if}
			<time datetime={dlog.data.createdAt}>
				{new Date(dlog.data.createdAt).toLocaleDateString(
					lang === 'en-us' ? 'en-US' : lang === 'ja-jp' ? 'ja-JP' : 'ko-KR',
					{ year: 'numeric', month: 'long', day: 'numeric' }
				)}
			</time>
		</div>
	</div>
</li>
