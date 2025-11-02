<script>
	import * as m from '$lib/paraglide/messages.js';
	import terminalBrowsing from '$lib/assets/terminal_browsing.png?enhanced';
</script>

<section class="markdown">
	<p>{m.introduction()}</p>

	<figure>
		<enhanced:img
			src={terminalBrowsing}
			alt={m.terminalBrowsing()}
			data-title={m.terminal()}
			loading="lazy"
			decoding="async"
		/>
		<figcaption>{m.terminalCaption()}</figcaption>
	</figure>
</section>
