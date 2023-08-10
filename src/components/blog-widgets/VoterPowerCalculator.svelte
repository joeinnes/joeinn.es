<script>
	export const year = 2015;
	let votedFor = 'Conservatives';
	let votesPerSeat = 0;
	let seatComparison = '';
	let voteValue = '1';
	/** @typedef {(2015 | 2017)} ElectionYears */
	/** @typedef {{
		[key: string]: {
			votes: number;
			seats: number;
		}
	}} PartyResults */

	/** @typedef  {{
		votesForWinningParties: number;
		totalVotes: number;
		totalSeats: number;
		electorate: number;
	}} TotalResults */

	/** @type Record<ElectionYears, PartyResults> */
	const votingData = {
		2015: {
			Conservatives: {
				votes: 11334920,
				seats: 331
			},
			Labour: {
				votes: 9344328,
				seats: 232
			},
			SNP: {
				votes: 1454436,
				seats: 56
			},
			'Lib Dems': {
				votes: 2415888,
				seats: 8
			},
			'Democratic Unionist Party': {
				votes: 184260,
				seats: 8
			},
			'Sinn Fein': {
				votes: 176232,
				seats: 4
			},
			'Plaid Cymru': {
				votes: 181694,
				seats: 3
			},
			SDLP: {
				votes: 99809,
				seats: 3
			},
			'Ulster Unionist Party': {
				votes: 114935,
				seats: 2
			},
			UKIP: {
				votes: 3881129,
				seats: 1
			},
			'Green Party': {
				votes: 1157613,
				seats: 1
			}
		},
		2017: {
			Conservatives: {
				votes: 13632914,
				seats: 317
			},
			Labour: {
				votes: 12874985,
				seats: 262
			},
			SNP: {
				votes: 977569,
				seats: 35
			},
			'Lib Dems': {
				votes: 2371772,
				seats: 12
			},
			'Democratic Unionist Party': {
				votes: 292316,
				seats: 10
			},
			'Sinn Fein': {
				votes: 238915,
				seats: 7
			},
			'Plaid Cymru': {
				votes: 164466,
				seats: 4
			},
			'Green Party': {
				votes: 525371,
				seats: 1
			},
			'Independent Unionist': {
				votes: 16148,
				seats: 1
			}
		}
	};

	/** @type Record<ElectionYears, TotalResults> */
	const totals = {
		2015: {
			votesForWinningParties: 30345244,
			totalVotes: 30691680,
			totalSeats: 650,
			electorate: 46425386
		},
		2017: {
			votesForWinningParties: 31094456,
			totalVotes: 32196918,
			totalSeats: 650,
			electorate: 46843896
		}
	};

	const averageVotesPerSeat = Math.round(
		totals[year].votesForWinningParties / totals[year].totalSeats
	);

	let voteStats;
	let seatsPerVoteShare = 0;
	$: {
		console.log('update');
		voteStats = votingData[year][votedFor];
		votesPerSeat = Math.round(voteStats.votes / voteStats.seats);
		seatsPerVoteShare = Math.round((voteStats.votes / totals[year].votesForWinningParties) * 650);
		voteValue = (1 / (votesPerSeat / averageVotesPerSeat)).toFixed(2);
	}
</script>

<select bind:value={votedFor} class="border-2 rounded-xl p-2">
	{#each Object.keys(votingData[year]) as party}
		<option>{party}</option>
	{/each}
</select>

{#if votedFor}
	<h2>Your vote was worth {voteValue}&times; the average!</h2>
	<p>
		An average candidate needed to receive {averageVotesPerSeat} votes to get a seat. Your party required
		{votesPerSeat} votes per seat.
	</p>

	<p>
		{#if seatsPerVoteShare == voteStats?.seats}
			Your party would have gained exactly as many seats.
		{:else}
			If the votes of everyone in your party had been as strong as an average vote, then your party
			would have received {seatsPerVoteShare} seats, instead of {voteStats?.seats}.
		{/if}
	</p>
{/if}

<style>
	h2 {
		@apply mt-4;
	}
</style>
