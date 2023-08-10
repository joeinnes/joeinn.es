<div class="flex flex-col items-center gap-4">
	<ul class="flex gap-8 my-4 py-4 text-2xl rounded-xl bg-white px-8 shadow-white">
		<li><a href="/">Home</a></li>
		<li><a href="/blog">Blog</a></li>
		<li><a href="/cv">CV</a></li>
		<li><a href="/contact">Contact</a></li>
	</ul>

	<main class="prose prose-2xl mx-auto flex flex-col justify-center">
		<slot />
	</main>
</div>

<style lang="postcss">
	div {
		@apply font-sans bg-cover bg-center transition-colors min-h-screen;
	}

	ul li a:after {
		content: '';
		@apply transition-transform border-b-4 border-primary-700 scale-0 block origin-left;
	}
	ul li a:hover:after {
		@apply scale-100;
	}
</style>
