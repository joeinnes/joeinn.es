<script>
	import Menu from '$components/Menu.svelte';
</script>

<div class="flex flex-col h-screen w-screen items-center gap-4">
	<Menu />
	<div class="flex-1 relative w-full">
		<slot />
	</div>
</div>
