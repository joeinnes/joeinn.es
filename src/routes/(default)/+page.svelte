<script>
	export let data;
</script>

<div class="flex flex-col-reverse md:flex-row items-center relative">
	<div
		class="absolute top-0 bottom-0 bg-primary-700 -right-[50vw] -left-[50vw]
"
	/>
	<div class="flex flex-col py-8 md:py-16 text-center md:text-left not-prose">
		<h1 class="font-semibold w-full mb-0 z-10 text-white flex-1 text-2xl md:text-6xl">
			{data.content?.title}
		</h1>
		<h2 class="text-white my-0 font-light z-10 text-xl md:text-2xl">
			{data.content?.tagline}
		</h2>
	</div>
	<div
		class="md:absolute rounded-full box-content z-10 md:h-full md:right-0 aspect-square border-white border-8 bg-contain h-48 w-48 md:w-auto mt-8 md:mt-0"
		style="background-image: url({data.content.photo});"
	/>
</div>
<h3>{data.content?.summary}</h3>
<p class="md:columns-2">
	{data.content?.body}
</p>
<a
	href="/contact"
	class="p-2 px-4 no-underline bg-primary-700 text-white rounded self-center hover:bg-primary-900 focus:bg-primary-900 transition-colors"
	>{data.content.cta}</a
>
