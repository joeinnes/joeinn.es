<script>
	import '../app.css';
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{$page.data.frontmatter?.title || 'Joe Innes'}</title>
</svelte:head>
<div
	style="background: {$page.data.bgOverride ||
		$page.data.frontmatter?.page_bg ||
		`hsl(${Math.random() * 360} ${Math.random() * 100}% ${Math.random() * 100}%)`}"
	class="min-h-full relative"
>
	<slot />
</div>
