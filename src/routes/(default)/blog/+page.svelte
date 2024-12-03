<script>
	import { run } from 'svelte/legacy';

	import { Heading2, Search } from 'lucide-svelte';
	let { data } = $props();
	const { posts } = data;
	/** @type string */
	let search = $state();

	let filteredPosts = $state(posts);
	run(() => {
		if (search) {
			filteredPosts = posts.filter(
				(el) => el.title?.toLocaleLowerCase().indexOf(search.toLocaleLowerCase()) > -1
			);
		} else {
			filteredPosts = posts;
		}
	});
</script>

<div class="max-w-[100%] w-[70ch] mx-auto md:pt-16 lg:pt-0">
	<div class="mb-8 flex flex-col place-items-center w-full relative">
		<h1 class="text-3xl lg:text-5xl font-bold">Joe Innes's Blog</h1>

		<div class="w-5/6 relative">
			<div
				class="absolute left-0 bottom-0 aspect-square h-auto grid place-items-center pb-2 text-gray-400"
			>
				<Search />
			</div>
			<input
				type="text"
				bind:value={search}
				class="border-b-2 w-full pl-10 outline-none text-ellipsis"
				placeholder="Search (e.g.: {posts[Math.floor(Math.random() * posts.length)]?.title})"
			/>
		</div>
	</div>

	<div
		class="flex flex-col text-ellipsis overflow-hidden divide-y gap-8"
		style="--border-bottom-hover: black"
	>
		{#each filteredPosts as post}
			<a href="/blog/{post?.slug}" class="no-underline font-normal">
				<article class="prose-h2:mb-0" style="--border-colour: {post?.page_bg || 'black'};">
					<div class="mt-8">
						<h2 class="text-xl md:text-3xl inline">
							{post?.title}
						</h2>
					</div>

					{post?.excerpt || "No excerpt available for this post. Click and see what's inside!"}
				</article>
			</a>
		{:else}
			Hmm, no results for "{search}", try something else?
		{/each}
	</div>
</div>

<style lang="postcss">
	article h2 {
		text-decoration: none;
		background-image: linear-gradient(var(--border-colour), var(--border-colour));
		background-position: 0% 100%;
		background-repeat: no-repeat;
		background-size: 0% 0.3rem;
		transition: background-size 0.3s;
	}

	article:hover h2,
	article:focus h2 {
		background-size: 100% 0.3rem;
	}
</style>
