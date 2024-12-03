<script>
	import { fade } from 'svelte/transition';
	import { enhance } from '$app/forms';
	let { form } = $props();
</script>

<div class="max-w-[100%] w-[70ch] mx-auto md:pt-16 lg:pt-0">
	<h1 class="text-3xl lg:text-5xl font-bold w-full text-center">Contact</h1>
	{#if !form}
		<form method="POST" use:enhance out:fade={{ duration: 200 }}>
			<label for="from">Your email address</label>
			<input type="email" name="from" placeholder="joe@joeinn.es	" />
			<label for="subject">Subject</label>
			<input type="text" name="subject" placeholder="Hi there!" />
			<label for="body">Body</label>
			<textarea name="body" placeholder="Here's what I wanted to say" rows="5"></textarea>
			<button
				type="submit"
				class="mt-4 py-2 px-4 bg-primary-700 text-white rounded hover:bg-primary-900 transition-colors"
				>Send</button
			>
		</form>
	{:else}
		<div in:fade={{ delay: 201 }}>
			<p>Thanks, your message was sent!</p>
			<p><a href="/">Back home?</a></p>
		</div>
	{/if}
</div>

<style lang="postcss">
	form {
		@apply flex flex-col;
	}
	input,
	textarea {
		@apply border rounded py-2 px-4;
	}
</style>
