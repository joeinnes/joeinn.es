<footer class="p-8 grid grid-cols-1 md:grid-cols-3 md:divide-x-2 w-full gap-4 bg-white mt-16">
	<div class="p-4">
		<h2 class="font-semibold text-4xl"><a href="/">Joe Innes</a></h2>
		<small>&copy; {new Date().getFullYear()}</small>
		<p>All opinions are my own unless clearly indicated otherwise.</p>
	</div>
	<div class="p-4">
		<h2 class="font-semibold text-primary-700 uppercase text-sm">Navigate</h2>
		<ul>
			<li><a href="/">Home</a></li>
			<li><a href="/blog">Blog</a></li>
			<li><a href="/cv">CV</a></li>
			<li><a href="/contact">Contact</a></li>
			<li><a href="/now">Now</a></li>
		</ul>
	</div>
	<div class="p-4">
		<h2 class="font-semibold text-primary-700 uppercase text-sm">Communicate</h2>
		<ul>
			<li>
				<a
					href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#106;&#111;&#101;&#64;&#106;&#111;&#101;&#105;&#110;&#110;&#46;&#101;&#115;"
					>&#106;&#111;&#101;&#64;&#106;&#111;&#101;&#105;&#110;&#110;&#46;&#101;&#115;</a
				>
			</li>
		</ul>
	</div>
</footer>

<style lang="postcss">
	ul li a:after {
		content: '';
		@apply transition-transform border-b-4 border-primary-700 scale-0 block origin-left;
	}
	ul li a:hover:after {
		@apply scale-100;
	}

	ul li {
		@apply flex;
	}
</style>
