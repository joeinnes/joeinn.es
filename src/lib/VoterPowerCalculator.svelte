<script>
  let voteValue = 1;
  export let votingData;

  let parties = Object.keys(votingData);
  parties = parties.filter((party) => votingData[party].votes);
  let selected = '';
  let voteStats;
  let votesPerSeat;
  let seatsPerVoteShare;
  let averageVotesPerSeat;
  $: {
    voteStats = votingData[selected.trim()];
    votesPerSeat = Math.round(voteStats?.votes / voteStats?.seats);
    seatsPerVoteShare = Math.round((voteStats?.votes / votingData.votesForWinningParties) * 650);
    averageVotesPerSeat = votingData.totalVotes / votingData.totalSeats;
    voteValue = 1 / (votesPerSeat / averageVotesPerSeat);
  }
</script>

<div class="bg-brand-green-100 shadow-md rounded-lg p-4">
  I voted for:
  <select bind:value={selected} class="bg-white rounded-md p-2">
    <option>None</option>
    {#each parties as party}
      <option>
        {party}
      </option>
    {/each}
  </select>

  {#if !isNaN(voteValue)}
    <h2>Your vote was worth {voteValue.toFixed(2)} &times; the average!</h2>

    <p>
      An average candidate needed to receive {averageVotesPerSeat.toFixed(2)} votes to get a seat. Your
      party required
      {votesPerSeat} votes per seat. {#if seatsPerVoteShare == voteStats?.seats}Your party would
        have gained exactly as many seats.{:else}If the votes of everyone in your party had been as
        strong as an average vote, then your party would have received {seatsPerVoteShare} seats, instead
        of {voteStats?.seats}.{/if}
    </p>

    <small
      >Note that votes for the speaker are excluded from calculations. If you voted for a candidate
      belonging to a party not on this list, then your vote was effectively worthless.</small
    >
  {/if}
</div>
