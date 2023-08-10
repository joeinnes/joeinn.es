<script>
	export let data;
	const { posts } = data;
</script>

<div class="max-w-[70ch] mx-auto pt-16 lg:pt-0">
	<div class="mb-8 flex flex-col place-items-center w-full relative">
		<h1 class="text-3xl lg:text-5xl font-bold">Joe Innes's Blog</h1>
	</div>

	<div
		class="flex flex-col text-ellipsis overflow-hidden divide-y gap-4"
		style="--border-bottom-hover: black"
	>
		{#each posts as post}
			<a href="/blog/{post?.slug}" class="no-underline font-normal">
				<article
					class="pt-4 flex flex-col justify-start items-start"
					style="--border-colour: {post?.metadata?.page_bg || 'black'};"
				>
					<h2 class="inline-block text-2xl">
						<br />
						{post?.metadata?.title}
					</h2>
					{post?.metadata?.excerpt}
				</article>
			</a>
			<!--
		{sortedBlogEntries.map(blogPostEntry => <BlogPostEntry post={blogPostEntry} />)}
			<!-- blogPostEntry.data.title?.toLowerCase().indexOf(searchString.toLowerCase()) > -1 && <BlogPostEntry post={blogPostEntry} />
		-->
		{/each}
	</div>
</div>

<style lang="postcss">
	article h2:after {
		content: '';
		border-color: var(--border-colour);
		@apply transition-transform border-b-4 scale-0 block
			origin-left;
	}
	article h2:hover:after {
		@apply scale-100;
	}
</style>
