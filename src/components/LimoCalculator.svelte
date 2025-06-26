<script>
	import { run } from 'svelte/legacy';

	let lengthOfRentalDays = $state(1); // 3 full days;
	let lengthOfRentalHours = $state(12);
	let lengthOfRentalMinutes = $state(0);
	let rentalLengthInMins = $state(3 * 24 * 60);
	let distance = $state(150);

	const minimumBAK = 25500;
	/** @param kms {number} */
	const BAKPriceForDistance = (kms) => {
		const fuelOnly = 29.92 * kms;
		const excessMileage = Math.max(kms - lengthOfRentalDays * 300, 0) * 40;
		return Math.round(fuelOnly + excessMileage);
	};

	/** @param kms {number} */
	const LimoPriceForDistance = (kms) => {
		let freeKms = lengthOfRentalDays * 100;
		if (lengthOfRentalHours > 0 || lengthOfRentalMinutes > 0) {
			freeKms = freeKms + 100;
		}
		const excessMileage = Math.max(kms - freeKms, 0) * 109;
		return Math.round(excessMileage);
	};

	const BAKRentalCost = () => Math.max(25500, lengthOfRentalDays * 8500);

	const LimoRentalCost = () => {
		if (
			lengthOfRentalDays > 3 ||
			(lengthOfRentalDays == 3 && (lengthOfRentalHours > 0 || lengthOfRentalMinutes > 0))
		) {
			return 'TOO MUCH TIME';
		}
		const startingFees = 1490 + 150;
		const dailyFees = lengthOfRentalDays * 13500;
		let hourlyFees = 13500;
		switch (lengthOfRentalHours) {
			case 0:
				hourlyFees = 0;
				break;
			case 1:
				hourlyFees = 4560;
				break;
			case 2:
				hourlyFees = 6880;
				break;
			case 3:
				hourlyFees = 9120;
				break;
			case 4:
				hourlyFees = 11440;
				break;
		}
		const minuteFees = lengthOfRentalMinutes * 76;
		return Math.round(startingFees + dailyFees + hourlyFees);
	};

	run(() => {
		rentalLengthInMins =
			lengthOfRentalMinutes + lengthOfRentalHours * 60 + lengthOfRentalDays * 24 * 60;
	});
</script>

<div class="flex flex-col gap-2">
	Distance: <input type="number" bind:value={distance} class="border-2 rounded p-2 border-black" />
	Days:
	<input type="number" bind:value={lengthOfRentalDays} class="border-2 rounded p-2 border-black" />
	Hours:
	<input
		type="number"
		bind:value={lengthOfRentalHours}
		max="23"
		class="border-2 rounded p-2 border-black"
	/>
	Minutes:
	<input
		type="number"
		bind:value={lengthOfRentalMinutes}
		max="59"
		class="border-2 rounded p-2 border-black"
	/>
</div>

{#key rentalLengthInMins}
	<table>
		<thead>
			<tr>
				<th></th>
				<th> MOL Limo </th>
				<th> BérAutóKirály </th>
			</tr>
		</thead><tbody>
			<tr>
				<td> Rental </td>
				<td>
					{LimoRentalCost()} HUF
				</td>
				<td>
					{BAKRentalCost()} HUF
				</td>
			</tr>
			<tr>
				<td> Distance </td>
				<td>
					{LimoPriceForDistance(distance)} HUF
				</td>
				<td>
					{BAKPriceForDistance(distance)} HUF
				</td>
			</tr>
		</tbody>
		<tfoot>
			<tr>
				<th> Total </th>
				<th>
					{LimoPriceForDistance(distance) + LimoRentalCost()} HUF
				</th>
				<th>
					{BAKPriceForDistance(distance) + BAKRentalCost()} HUF
				</th>
			</tr>
		</tfoot>
	</table>
	<p>
		For your journey, {LimoPriceForDistance(distance) + LimoRentalCost() >
		BAKPriceForDistance(distance) + BAKRentalCost()
			? 'a normal rental'
			: 'a Limo'} is cheaper.
	</p>{/key}
