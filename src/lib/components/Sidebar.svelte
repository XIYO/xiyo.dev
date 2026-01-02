<script lang="ts">
	import Home from '@lucide/svelte/icons/home';
	import FileText from '@lucide/svelte/icons/file-text';
	import Info from '@lucide/svelte/icons/info';
	import HandFist from '@lucide/svelte/icons/hand-fist';
	import Gamepad2 from '@lucide/svelte/icons/gamepad-2';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { innerWidth } from 'svelte/reactivity/window';
	import { deLocalizeHref } from '$lib/paraglide/runtime.js';
	import { localizeHref, locales } from '$lib/paraglide/runtime.js';
	import type { Component } from 'svelte';

	let sidebarElement = $state<HTMLElement | null>(null);

	// Tailwind 'sm' = 640px. 모바일(<640px)에서만 자동 닫기
	// svelte/reactivity/window: innerWidth.current is undefined on server
	const isMobile = $derived((innerWidth.current ?? Infinity) < 640);

	// 네비게이션 시 모바일에서만 사이드바 자동 닫기
	afterNavigate(() => {
		if (isMobile) sidebarElement?.hidePopover();
	});

	const menuItems = [
		{ label: 'Home', icon: Home, path: '/' },
		{ label: 'Posts', icon: FileText, path: '/posts' },
		{ label: 'About', icon: Info, path: '/about' },
		{ label: 'Glove', icon: HandFist, path: '/glove' },
		{ label: 'Games', icon: Gamepad2, path: '/games' }
	];

	const localeEmojis: Record<string, string> = {
		'ko-kr': '🇰🇷',
		'en-us': '🇺🇸',
		'ja-jp': '🇯🇵'
	};


	const handleHoverOpen = () => {
		sidebarElement?.showPopover();
	};

	const handleHoverClose = () => {
		sidebarElement?.hidePopover();
	};
</script>

{#snippet sidebarItem(
	icon: Component | string | null | undefined,
	label: string,
	href: string,
	isActive: boolean = false,
	reload: boolean = false
)}
	<a
		href={href}
		class={`flex h-12 w-full text-sm uppercase tracking-widest transition ${isActive ? 'preset-filled-surface-200-800 font-bold' : 'hover:preset-filled-surface-400-600'}`}
		aria-label={label}
		title={label}
		data-sveltekit-reload={reload ? '' : undefined}
	>
		<div class="w-12 grid place-items-center-safe">
			{#if typeof icon === 'string'}
				<span aria-hidden="true" class="text-lg leading-none">{@html icon}</span>
			{:else if icon}
				{@const IconComponent = icon}
				<IconComponent size={12} />
			{:else}
				<span aria-hidden="true" class="text-lg leading-none">•</span>
			{/if}
		</div>
		<span class="flex-1 mx-2 content-center-safe">{label}</span>
	</a>
{/snippet}

<aside bind:this={sidebarElement} class="group fixed sm:left-0 sm:top-0 w-full sm:w-12 sm:open:w-64 h-screen
             transition-discrete
             starting:open:opacity-0
             transition-opacity
             sm:[transition-property:width]
             duration-300
             ease-out
             border-r border-surface-200-800
             sm:flex flex-col bg-surface-50-950/70 backdrop-blur"
       id="sidebar"
       popover
       onpointerleave={handleHoverClose}
       onpointerenter={handleHoverOpen}
>
    <div class="flex flex-col w-full h-full sm:w-64 overflow-x-hidden divide-y divide-surface-200-800">
        <!-- 헤더: 로고 -->
        <header class="flex w-full h-12">
            <button aria-label="SvelteHole 홈"
                    class="flex h-12 w-full hover:preset-filled-surface-400-600"
                    popovertarget="sidebar"
                    title="SvelteHole 홈">
                <span class="w-12 h-full grid place-items-center-safe">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu-icon lucide-menu ">
                        <path d="M4 5h16" class="transition-all duration-300 origin-[12px_5px] group-open:translate-y-[7px] group-open:rotate-45"/>
                        <path d="M4 12h16" class="transition-opacity duration-300 group-open:opacity-0"/>
                        <path d="M4 19h16" class="transition-all duration-300 origin-[12px_19px] group-open:-translate-y-[7px] group-open:-rotate-45"/>
                    </svg>
                </span>
                <span class="flex-1 h-full text-left content-center-safe mx-2 text-sm">Menu</span>
            </button>
        </header>

        <!-- 바디: 메인 내비게이션 (스크롤 가능) -->
        <nav class="flex-1 flex flex-col w-full overflow-y-auto">
            {#each menuItems as item}
                {@const currentPath = deLocalizeHref(page.url.pathname)}
                {@const isActive = item.path === '/' ? currentPath === '/' : currentPath.startsWith(item.path)}
                {@render sidebarItem(item.icon, item.label, localizeHref(item.path), isActive)}
            {/each}
        </nav>
        <!-- 푸터: 언어 선택 -->
        <footer>
            {#each locales as locale (locale)}
                {@render sidebarItem(
                    localeEmojis[locale] ?? '🌐',
                    locale,
                    localizeHref(page.url.pathname, { locale }),
                    false,
                    true
                )}
            {/each}
        </footer>
    </div>
</aside>

<button aria-label="SvelteHole 홈"
        class="fixed sm:hidden left-0 top-0 w-12 h-12 grid place-items-center-safe"
        popovertarget="sidebar"
        title="SvelteHole 홈">
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu-icon lucide-menu">
        <path d="M4 5h16"/>
        <path d="M4 12h16"/>
        <path d="M4 19h16"/>
    </svg>
</button>

<style>
    @reference "../../app.css";

    :global(body) {
        @apply sm:ml-12;
    }
</style>
