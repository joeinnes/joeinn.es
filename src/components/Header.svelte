<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} [link]
	 */

	/** @type {Props} */
	let { link = '/' } = $props();
</script>

<header
	class="py-2 print:hidden my-4 md:my-0 pl-4 pr-3 md:px-4 md:py-4 fixed z-10 rounded-r-xl bg-[#ffffffcc] md:bg-inherit"
>
	<nav>
		<a
			href={link}
			class="border-2 border-black lg:border-4 px-2 p-1 lg:p-4 font-bold text-2xl lg:text-4xl aspect-square flex items-center justify-center bg-white w-12 lg:w-20"
			>JI</a
		>
	</nav>
</header>
