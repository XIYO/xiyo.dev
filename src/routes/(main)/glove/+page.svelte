<script>
	import jjakak from '$lib/assets/jjakak.jpeg?enhanced';
	import ttodo from '$lib/assets/ttodo.png?enhanced';
	import bbakey from '$lib/assets/bbakey.png?enhanced';
	import extractor from '$lib/assets/extractor.png?enhanced';
	import zheon from '$lib/assets/zheon.png?enhanced';
	import * as m from '$lib/paraglide/messages.js';
</script>

<main>
	<div class="p-4 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-8">
		<a class="text-center" href="https://jjakak.xiyo.dev" target="_blank">
			<enhanced:img
				src={jjakak}
				alt={m.jjakakImgAlt()}
				class="object-cover aspect-square w-full h-auto"
			/>
			<h2>JJaKaK</h2>
			<p>{m.jjakakDescription()}</p>
		</a>
		<a class="text-center" href="https://ttodo.xiyo.dev" target="_blank">
			<enhanced:img
				src={ttodo}
				alt={m.ttodoImgAlt()}
				class="object-cover aspect-square w-full h-auto"
			/>
			<h2>ttodo</h2>
			<p>{m.ttodoDescription()}</p>
		</a>
		<a class="text-center" href="https://bbakey.xiyo.dev" target="_blank">
			<enhanced:img
				src={bbakey}
				alt={m.bbakeyImgAlt()}
				class="object-cover aspect-square w-full h-auto"
			/>
			<h2>BbaKey</h2>
			<p>{m.bbakeyDescription()}</p>
		</a>
		<a class="text-center" href="https://extractor.xiyo.dev" target="_blank">
			<enhanced:img
				src={extractor}
				alt={m.extractorImgAlt()}
				class="object-cover aspect-square w-full h-auto"
			/>
			<h2>Extractor</h2>
			<p>{m.extractorDescription()}</p>
		</a>
		<a class="text-center" href="https://zheon.xiyo.dev" target="_blank">
			<enhanced:img
				src={zheon}
				alt={m.zheonImgAlt()}
				class="object-cover aspect-square w-full h-auto"
			/>
			<h2>Zheon</h2>
			<p>{m.zheonDescription()}</p>
		</a>
	</div>
</main>
