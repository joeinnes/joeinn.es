<script>
	import { enhance } from '$app/forms';
</script>

<div class="max-w-[100%] w-[70ch] mx-auto md:pt-16 lg:pt-0">
	<h1 class="font-semibold">Contact</h1>
	<form method="POST" use:enhance>
		<label for="from">Your email address</label>
		<input type="email" name="from" placeholder="joe@joeinn.es	" />
		<label for="subject">Subject</label>
		<input type="text" name="subject" placeholder="Hey, I love your blog (said no-one ever)" />
		<label for="body">Body</label>
		<textarea name="body" placeholder="Here's a message" />
		<button
			type="submit"
			class="mt-4 py-2 px-4 bg-primary-700 text-white rounded hover:bg-primary-900 transition-colors"
			>Send</button
		>
	</form>
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
