<script>
	import '../app.css';
	import { page } from '$app/stores';
	import PageTransition from './transition.svelte';
	export let data;
</script>

<svelte:head>
	<title>{$page.data.meta?.title || 'Joe Innes'}</title>
	<meta
		name="description"
		content={$page.data.meta?.excerpt ||
			'I build teams who create excellent tech support experiences for enterprise customers.'}
	/>
</svelte:head>
<PageTransition url={data.url}>
	<div
		style="background: {($page.error && 'white') ||
			$page.data.bgOverride ||
			$page.data.meta?.page_bg ||
			`hsl(${Math.random() * 360} ${Math.random() * 100}% ${Math.random() * 100}%)`}"
		class="min-h-full relative overflow-x-hidden pb-8"
	>
		<slot />
	</div>
</PageTransition>
