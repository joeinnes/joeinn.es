<script>
  import Footer from '$lib/Footer.svelte';
  import Header from '$lib/Header.svelte';
  import '../styles/tailwind-output.css';
</script>

<svelte:head>
  <title>{import.meta.env.VITE_SITE_NAME}</title>
</svelte:head>

<div class="container w-screen md:w-3/4 lg:w-1/2 mx-auto font-body font-light">
  <Header />
  <slot />
</div>

<Footer />
