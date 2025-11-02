<script>
	import DlogList from '$lib/components/dlog/DlogList.svelte';
	import HeroSection from '$lib/components/HeroSection.svelte';
	import { page } from '$app/state';
</script>

<main>
	<HeroSection />
	<hr class="hr" />
	<DlogList dlogs={page.data.dlogs} lang={page.data.lang} />
</main>
