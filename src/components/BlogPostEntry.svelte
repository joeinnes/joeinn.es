<script>
	export let post;
	import dayjs from 'dayjs';
</script>

{#if post}
	<a href="/{post?.slug}" class="py-4 flex-1 w-full group">
		<article class="post">
			<div class="py-4 w-full">
				<h2
					class="post-title hvr-underline-from-left"
					style="--border-bottom-hover: {post?.data.page_bg ?? 'currentColor'}"
				>
					{post?.data?.title}
				</h2>
				<p class="post-date">
					{dayjs(post?.data?.date).format('dddd D MMM YYYY, h:mm a')}
				</p>
				{#if post?.data?.excerpt}
					<p class="post-excerpt">{post?.data?.excerpt}</p>
				{/if}
			</div>
		</article>
	</a>
{/if}

<style lang="scss">
	.post-list {
		@apply flex flex-col px-4 lg:px-0;
	}
	.post-list .post:first-child {
		@apply pt-0;
	}
	.post {
		@apply flex;
	}
	.post-title {
		@apply font-bold text-xl lg:text-2xl;
	}
	.post-date {
		@apply font-light text-sm text-gray-500;
	}

	.post-excerpt {
		@apply font-normal text-gray-700;
	}

	.hvr-underline-from-left {
		display: inline-block;
		vertical-align: middle;
		-webkit-transform: perspective(1px) translateZ(0);
		transform: perspective(1px) translateZ(0);
		box-shadow: 0 0 1px rgba(0, 0, 0, 0);
		position: relative;
		overflow: hidden;
	}
	.hvr-underline-from-left:before {
		content: '';
		position: absolute;
		z-index: -1;
		left: 0;
		right: 100%;
		bottom: 0;
		background: var(--border-bottom-hover);
		height: 4px;
		-webkit-transition-property: right;
		transition-property: right;
		-webkit-transition-duration: 0.2s;
		transition-duration: 0.2s;
		-webkit-transition-timing-function: ease-out;
		transition-timing-function: ease-out;
	}
	a:hover .hvr-underline-from-left:before,
	a:focus .hvr-underline-from-left:before,
	a:active .hvr-underline-from-left:before {
		right: 0;
	}
</style>
