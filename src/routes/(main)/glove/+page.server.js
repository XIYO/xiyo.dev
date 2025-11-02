import * as m from '$lib/paraglide/messages.js';

export function load({ depends }) {
	depends('language:current');

	return {
		title: m.globe(),
		description: m.globeDescription()
	};
}
