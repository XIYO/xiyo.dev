<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/Header.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { page } from '$app/state';

	const { children } = $props();
	const pageTitle = $derived(page.data.meta?.title);
</script>

<Header title={pageTitle} />
<Sidebar />
{@render children()}
<Footer />
