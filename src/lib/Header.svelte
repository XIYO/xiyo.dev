<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		title?: string;
	}

	const { title }: Props = $props();
	const displayTitle = $derived(title ?? m.title());
</script>

<header id="main-header" class="sticky top-0 flex h-12 border-b border-surface-200-800 bg-surface-50-950/70 backdrop-blur">
	<h1 class="flex-1 text-center content-center-safe font-black text-2xl uppercase">
		{displayTitle}
	</h1>
</header>
