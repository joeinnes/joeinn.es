---
title: Voter Power Calculator (2017 UK General Election)
slug: voter-power-calculator-uk-general-election-2017
date_published: 2017-06-18T22:00:00.000Z
date_updated: 2020-03-12T22:43:49.000Z
tags: Portfolio, voter power, democracy, politics
---

<script>
  import VoterPowerCalculator from '$lib/VoterPowerCalculator.svelte';
  const votingData = {
  'Conservatives': {
    'votes': 13632914,
    'seats': 317
  },
  'Labour': {
    'votes': 12874985,
    'seats': 262
  },
  'SNP': {
    'votes': 977569,
    'seats': 35
  },
  'Lib Dems': {
    'votes': 2371772,
    'seats': 12
  },
  'Democratic Unionist Party': {
    'votes': 292316,
    'seats': 10
  },
  'Sinn Fein': {
    'votes': 238915,
    'seats': 7
  },
  'Plaid Cymru': {
    'votes': 164466,
    'seats': 4
  },
  'Green Party': {
    'votes': 525371,
    'seats': 1
  },
  'Independent Unionist': {
    'votes': 16148,
    'seats':1
  },
  'votesForWinningParties': 31094456,
  'totalVotes': 32196918,
  'totalSeats': 650,
  'electorate': 46843896
}
</script>

<VoterPowerCalculator {votingData} />