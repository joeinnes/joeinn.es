<script>
  export let countDownDate = new Date();
  let now = new Date();
  let distance = countDownDate.getTime() - now.getTime();
  let days, hours, minutes, seconds;

  // Update the count down every 1 second
  const x = setInterval(function () {
    // Get today's date and time
    now = new Date();
    distance = countDownDate.getTime() - now.getTime();

    // Time calculations for days, hours, minutes and seconds
    days = Math.floor(distance / (1000 * 60 * 60 * 24));
    hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // If the count down is finished, write some text
    if (distance < 0) {
      clearInterval(x);
      document.getElementById('demo').innerHTML = 'Gone!';
    }
  }, 1000);
</script>

{#if distance < 0}
  Gone!
{:else}
  {days}d {hours}h {minutes}m {seconds}s
{/if}
