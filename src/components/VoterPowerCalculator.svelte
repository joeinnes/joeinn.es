<script>
  /**
   * @typedef {Object} Props
   * @property {number} [year]
   */

  /** @type {Props} */
  let { year = 2015 } = $props();
  let votedFor = $state("Labour");
  /** @typedef {(2015 | 2017 | 2024)} ElectionYears */
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
        seats: 331,
      },
      Labour: {
        votes: 9344328,
        seats: 232,
      },
      SNP: {
        votes: 1454436,
        seats: 56,
      },
      "Lib Dems": {
        votes: 2415888,
        seats: 8,
      },
      "Democratic Unionist Party": {
        votes: 184260,
        seats: 8,
      },
      "Sinn Fein": {
        votes: 176232,
        seats: 4,
      },
      "Plaid Cymru": {
        votes: 181694,
        seats: 3,
      },
      SDLP: {
        votes: 99809,
        seats: 3,
      },
      "Ulster Unionist Party": {
        votes: 114935,
        seats: 2,
      },
      UKIP: {
        votes: 3881129,
        seats: 1,
      },
      "Green Party": {
        votes: 1157613,
        seats: 1,
      },
    },
    2017: {
      Conservatives: {
        votes: 13632914,
        seats: 317,
      },
      Labour: {
        votes: 12874985,
        seats: 262,
      },
      SNP: {
        votes: 977569,
        seats: 35,
      },
      "Lib Dems": {
        votes: 2371772,
        seats: 12,
      },
      "Democratic Unionist Party": {
        votes: 292316,
        seats: 10,
      },
      "Sinn Fein": {
        votes: 238915,
        seats: 7,
      },
      "Plaid Cymru": {
        votes: 164466,
        seats: 4,
      },
      "Green Party": {
        votes: 525371,
        seats: 1,
      },
      "Independent Unionist": {
        votes: 16148,
        seats: 1,
      },
    },

    2024: {
      Labour: {
        votes: 9704655,
        seats: 411,
      },
      Conservatives: {
        votes: 6827311,
        seats: 121,
      },
      "Liberal Democrats": {
        votes: 3519199,
        seats: 72,
      },
      "Scottish National Party": {
        votes: 724758,
        seats: 9,
      },
      "Sinn Féin": {
        votes: 210891,
        seats: 7,
      },
      Independent: {
        votes: 564243,
        seats: 6,
      },
      "Reform UK": {
        votes: 4117221,
        seats: 5,
      },
      "Democratic Unionist Party": {
        votes: 172058,
        seats: 5,
      },
      "Green Party of England and Wales": {
        votes: 1841888,
        seats: 4,
      },
      "Plaid Cymru": {
        votes: 194811,
        seats: 4,
      },
      "Social Democratic and Labour Party": {
        votes: 86861,
        seats: 2,
      },
      "Alliance Party of Northern Ireland": {
        votes: 117191,
        seats: 1,
      },
      "Ulster Unionist Party": {
        votes: 94779,
        seats: 1,
      },
      "Traditional Unionist Voice": {
        votes: 48685,
        seats: 1,
      },
    },
  };

  /** @type Record<ElectionYears, TotalResults> */
  const totals = {
    2015: {
      votesForWinningParties: 30345244,
      totalVotes: 30691680,
      totalSeats: 649,
      electorate: 46425386,
    },
    2017: {
      votesForWinningParties: 31094456,
      totalVotes: 32196918,
      totalSeats: 649,
      electorate: 46843896,
    },
    2024: {
      votesForWinningParties: 28249789,
      totalSeats: 649,
      totalVotes: 28805931,
      electorate: 48214128,
    },
  };

  const averageVotesPerSeat = Math.round(
    totals[year].votesForWinningParties / totals[year].totalSeats,
  );

  const voteStats = $derived(votingData[year][votedFor]);
  const votesPerSeat = $derived(Math.round(voteStats.votes / voteStats.seats));
  const seatsPerVoteShare = $derived(
    Math.round((voteStats.votes / totals[year].votesForWinningParties) * 649),
  );
  const voteValue = $derived(
    (1 / (votesPerSeat / averageVotesPerSeat)).toFixed(2),
  );
</script>

<select bind:value={votedFor} class="p-2 border-2 rounded-xl">
  {#each Object.keys(votingData[year]) as party}
    <option>{party}</option>
  {/each}
</select>

{#if votedFor}
  <h2>Your vote was worth {voteValue}&times; the average!</h2>
  <p>
    Your party got {voteStats?.seats} seats with {voteStats?.votes} votes ({(
      (100 * voteStats?.votes) /
      totals[year].totalVotes
    ).toFixed(1)}% vote share)
  </p>
  <p>
    An average candidate needed to receive {averageVotesPerSeat} votes to get a seat.
    Your party required
    {votesPerSeat} votes per seat.
  </p>

  <p>
    {#if seatsPerVoteShare == voteStats?.seats}
      Your party would have gained exactly as many seats.
    {:else}
      If everyone's vote counted equally, then your party would have received {seatsPerVoteShare}
      seats, instead of {voteStats?.seats}.
    {/if}
  </p>
{/if}

<style>
  @reference 'tailwindcss';
  h2 {
    @apply mt-4;
  }
</style>
