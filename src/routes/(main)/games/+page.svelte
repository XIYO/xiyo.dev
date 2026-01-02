<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import * as m from '$lib/paraglide/messages.js';

	const games = [
		{
			href: '/games/tic-tac-toe',
			title: () => m.gameTicTacToeTitle(),
			description: () => m.gameTicTacToeDescription()
		},
		{
			href: '/games/ladder',
			title: () => m.gameLadderTitle(),
			description: () => m.gameLadderDescription()
		}
	];
</script>

<main class="p-4 max-w-4xl mx-auto">
	<ul class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
		{#each games as game}
			<li>
				<a
					href={localizeHref(game.href)}
					class="block p-6 bg-surface-100-900 hover:bg-surface-200-800 rounded-lg transition-colors"
				>
					<h2 class="text-xl font-semibold mb-2">{game.title()}</h2>
					<p class="text-sm text-surface-500">{game.description()}</p>
				</a>
			</li>
		{/each}
	</ul>
</main>
