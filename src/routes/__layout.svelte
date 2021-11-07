<script>
  import Footer from '$lib/Footer.svelte';
  import '../styles/tailwind-output.css';
  //import '../style.css';
</script>

<svelte:head>
  <title>Joe Innes</title>
</svelte:head>

<div class="container w-screen md:w-3/4 lg:w-1/2 mx-auto font-body font-light">
  <slot />
</div>

<Footer />
