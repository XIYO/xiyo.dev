import * as m from '$lib/paraglide/messages.js';

export const prerender = true;

export function load() {
	return {
		meta: {
			title: m.gameLadderTitle(),
			description: m.gameLadderDescription()
		}
	};
}
