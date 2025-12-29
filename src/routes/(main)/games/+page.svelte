<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
</script>

<main class="p-4 max-w-4xl mx-auto">
	<h1 class="text-2xl font-bold mb-8">Games</h1>

	<ul class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
		<li>
			<a
				href={localizeHref('/games/tic-tac-toe')}
				class="block p-6 bg-surface-100-900 hover:bg-surface-200-800 rounded-lg transition-colors"
			>
				<h2 class="text-xl font-semibold mb-2">Tic-Tac-Toe</h2>
				<p class="text-sm text-surface-500">Classic 3x3 grid game</p>
			</a>
		</li>
	</ul>
</main>
