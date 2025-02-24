<ul
	class="flex gap-4 md:gap-8 my-4 px-4 py-2 md:py-4 rounded-xl bg-white md:px-8 shadow-white text-lg md:text-2xl"
>
	<li><a href="/">Home</a></li>
	<li><a href="/blog">Blog</a></li>
	<li><a href="/til">Smidgeons</a></li>
	<li><a href="/cv">CV</a></li>
	<li><a href="/contact">Contact</a></li>
</ul>

<style lang="postcss">
	ul li a:after {
		content: '';
		@apply transition-transform border-b-4 border-primary-700 scale-0 block origin-left;
	}
	ul li a:hover:after {
		@apply scale-100;
	}
</style>
