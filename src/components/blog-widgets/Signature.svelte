<script>
	import { onMount } from 'svelte';

	/** @type SVGPathElement */
	let stroke1;
	/** @type SVGPathElement */
	let stroke2;
	/** @type SVGElement */
	let svg;
	let shouldAnimate = false;

	/** @param {number} totalDur */
	const calcPaths = (totalDur) => {
		// unset 'animated' class to body which will reset the animation
		shouldAnimate = false;

		// get all SVG elements - lines and dots
		const paths = [stroke1, stroke2];

		// prepare path length variable
		let len = 0;

		// prepare animation delay length variable
		let delay = 0;

		// escape if no elements found
		if (!paths.length) {
			return false;
		}

		// set duration in seconds of animation to default if not set
		const totalDuration = totalDur || 7;

		// calculate the full path length
		paths.forEach((path) => {
			const totalLen = path.getTotalLength();
			len += totalLen;
		});

		paths.forEach((path) => {
			const pathElem = path;

			// get current path length
			const totalLen = path.getTotalLength();

			// calculate current animation duration
			const duration = (totalLen / len) * totalDuration;

			// set animation duration and delay
			pathElem.style.animationDuration = `${duration < 0.2 ? 0.2 : duration}s`;
			pathElem.style.animationDelay = `${delay}s`;

			// set dash array and offset to path length - this is how you hide the line
			pathElem.setAttribute('stroke-dasharray', totalLen + '');
			pathElem.setAttribute('stroke-dashoffset', totalLen + '');

			// set delay for the next path - added .2 seconds to make it more realistic
			delay += duration + 0.2;
		});

		// set 'animated' class to body which will start the animation

		return true;
	};

	onMount(() => {
		calcPaths(0.5);
		let observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						shouldAnimate = true;
						observer.disconnect();
					}
				});
			},
			{ threshold: 1 }
		);
		observer.observe(svg);
	});
</script>

<svg
	version="1.1"
	id="sig"
	viewBox="0 0 230 325"
	xmlns="http://www.w3.org/2000/svg"
	class="text-primary w-32 h-auto my-4 print:hidden"
	bind:this={svg}
>
	<defs id="defs2" />
	<g id="layer1" transform="translate(-145.27095,-48.303681)">
		<path
			bind:this={stroke1}
			class="stroke"
			class:animate={shouldAnimate}
			d="m 161.31694,50.303681 c 37.977,313.591999 -22.242,410.046999 -13.054,232.429999 7.308,-141.27 225.062,-159.769 225.123,-159.229"
			style="fill-opacity:0;stroke:currentColor;stroke-width:4px;stroke-linecap:round;stroke-linejoin:round"
		/>
		<path
			bind:this={stroke2}
			class="stroke"
			class:animate={shouldAnimate}
			d="m 220.65994,215.46368 c 52.672,-56.621 113.996,-54.098 150.314,-58.776"
			style="fill-opacity:0;stroke:currentColor;stroke-width:4px;stroke-linecap:round;stroke-linejoin:round"
		/>
	</g>
</svg>

<svg
	version="1.1"
	id="sig"
	viewBox="0 0 230 325"
	xmlns="http://www.w3.org/2000/svg"
	class="text-primary w-32 h-auto my-4 hidden print:block"
>
	<defs id="defs2" />
	<g id="layer1" transform="translate(-145.27095,-48.303681)">
		<path
			d="m 161.31694,50.303681 c 37.977,313.591999 -22.242,410.046999 -13.054,232.429999 7.308,-141.27 225.062,-159.769 225.123,-159.229"
			style="fill-opacity:0;stroke:currentColor;stroke-width:4px;stroke-linecap:round;stroke-linejoin:round"
		/>
		<path
			d="m 220.65994,215.46368 c 52.672,-56.621 113.996,-54.098 150.314,-58.776"
			style="fill-opacity:0;stroke:currentColor;stroke-width:4px;stroke-linecap:round;stroke-linejoin:round"
		/>
	</g>
</svg>

<style>
	.stroke {
		opacity: 0;
		animation-timing-function: ease-in;
		animation-fill-mode: forwards;
	}

	.animate {
		opacity: 1;
		animation-name: line;
	}

	@keyframes line {
		100% {
			stroke-dashoffset: 0;
		}
	}
	@media print {
		.stroke {
			animation: none;
			opacity: 1;
		}
	}
</style>
