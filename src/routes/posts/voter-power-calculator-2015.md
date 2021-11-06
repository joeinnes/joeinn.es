---
title: Voter Power Calculator (2015 UK General Election)
slug: voter-power-calculator-2015
date_published: 2016-11-21T23:00:00.000Z
date_updated: 2020-03-12T22:44:27.000Z
tags: election, voter power, democracy, Portfolio
---
<script>
    import VoterPowerCalculator from '$lib/VoterPowerCalculator.svelte';
const votingData = {
  'Conservatives': {
    'votes': 11334920,
    'seats': 331
  },
  'Labour': {
    'votes': 9344328,
    'seats': 232
  },
  'SNP': {
    'votes': 1454436,
    'seats': 56
  },
  'Lib Dems': {
    'votes': 2415888,
    'seats': 8
  },
  'Democratic Unionist Party': {
    'votes': 184260,
    'seats': 8
  },
  'Sinn Fein': {
    'votes': 176232,
    'seats': 4
  },
  'Plaid Cymru': {
    'votes': 181694,
    'seats': 3
  },
  'SDLP': {
    'votes': 99809,
    'seats': 3
  },
  'Ulster Unionist Party': {
    'votes': 114935,
    'seats': 2
  },
  'UKIP': {
    'votes': 3881129,
    'seats': 1
  },
  'Green Party': {
    'votes': 1157613,
    'seats': 1
  },
  'votesForWinningParties': 30345244,
  'totalVotes': 30691680,
  'totalSeats': 650,
  'electorate': 46425386
}
</script>
<VoterPowerCalculator {votingData} />