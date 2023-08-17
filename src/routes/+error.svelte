<script>
	import { page } from '$app/stores';
</script>

<div class="error mt-8">
	<h1 class="font-semibold text-2xl">{$page.status}: {$page.error?.message}</h1>
</div>

<style>
	.error {
		height: 100%;
		display: grid;
		place-content: center;
	}
</style>
