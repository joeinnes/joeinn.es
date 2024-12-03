<script>
	import { run } from 'svelte/legacy';

	import { onMount } from 'svelte';

	let weather = $state();
	let loading = $state(true);
	let userLat = $state(0);
	let userLon = $state(0);
	let minLon = $state(0);
	let minLat = $state(0);
	let maxLon = $state(0);
	let maxLat = $state(0);
	let isErr = false;

	onMount(async () => {
		const [lat, lon, err] = await getLocation();
		userLat = lat;
		userLon = lon;
		isErr = err;

		const res = await fetch(
			`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&current_weather=true&timezone=auto`
		);
		const json = await res.json();
		weather = json;
		loading = false;
	});
	const codes = {
		0: 'clear',
		1: 'mainly clear',
		2: 'partly cloudy',
		3: 'overcast',
		45: "there's fog",
		48: 'there\'s "depositing rime fog", whatever that is',
		51: "there's light drizzle",
		53: "it's drizzling",
		55: "there's some dense drizzle",
		56: "there's light, freezing drizzle",
		57: "there's dense freezing drizzle",
		61: "it's spitting",
		63: "it's raining",
		65: "it's raining heavily",
		66: "there's light freezing rain",
		67: "there's heavy freezing rain",
		71: "it's snowing a little",
		73: "it's snowing",
		75: "it's snowing heavily",
		77: 'there are snow grains',
		80: 'there are slight showers',
		81: 'there are moderate showers',
		82: 'there are violent showers',
		85: 'there are slight snow showers',
		86: 'there are heavy snow showers',
		95: "it's stormy",
		96: "there's a hailstorm",
		99: "there's a heavy hailstorm"
	};

	/** @returns Promise<[lat: number, lon: number, error: boolean]> */

	const getLocation = async () => {
		return new Promise((resolve, reject) => {
			if ('geolocation' in navigator) {
				navigator.geolocation.getCurrentPosition((position) => {
					let lat = position.coords.latitude;
					let lon = position.coords.longitude;
					resolve([lat, lon, false]);
				});
			} else {
				reject([0, 0, true]);
			}
		});
	};
	run(() => {
		minLon = userLon - 0.2;
		maxLon = userLon + 0.2;
		minLat = userLat - 0.2;
		maxLat = userLat + 0.2;
	});
</script>

{#if !loading}
	<p>
		Currently, it's {weather?.current_weather?.temperature}°C and {codes[
			weather?.current_weather?.weathercode
		]}.
	</p>
	{#if userLat && userLon}
		<iframe
			title="map"
			width="100%"
			class="aspect-video full-bleed"
			frameborder="0"
			scrolling="no"
			marginheight="0"
			marginwidth="0"
			src="https://www.openstreetmap.org/export/embed.html?bbox={minLon}%2C{minLat}%2C{maxLon}%2C{maxLat}&amp;layer=mapnik&amp;marker={userLat}%2C{userLon}"
		></iframe>
	{/if}
	<p>
		Weather data kindly provided by
		<a href="https://open-meteo.com/" target="_blank">Open-Meteo.com</a>. Map by
		<a href="https://openstreetmap.org" target="_blank">OpenStreetMap.org</a>
	</p>
{:else}
	<p>Loading...</p>
{/if}
