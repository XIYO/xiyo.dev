<script>
	import * as m from '$lib/paraglide/messages.js';

	// Get title dynamically to ensure it updates with language changes
	const title = $derived(m.title());
</script>

<header
	id="main-header"
	class="sticky top-0 flex h-12 border-b border-surface-200-800 bg-surface-50-950/70 backdrop-blur"
>
	<h1 class="flex-1 text-center content-center-safe font-black text-2xl uppercase">
		{title}
	</h1>
</header>
