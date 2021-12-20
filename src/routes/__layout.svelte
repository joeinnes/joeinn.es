<script context="module" lang="ts">
  export async function load({ page }) {
    return {
      props: {
        page
      }
    };
  }
</script>

<script lang="ts">
  import '@picocss/pico';

  import Header from '$lib/Header.svelte';
  import Hero from '$lib/Hero.svelte';
  import Footer from '$lib/Footer.svelte';

  import { theme } from '$lib/store';
  import { browser } from '$app/env';
  export let page;
  $: {
    if (browser) {
      document.documentElement.dataset.theme = $theme;
    }
  }
</script>

<svelte:head>
  <title>{import.meta.env.VITE_SITE_NAME}</title>
</svelte:head>

{#if page.path === '/'}
  <div class="container hero-header">
    <Header />
    <Hero />
  </div>
{:else}
  <div class="container"><Header /></div>
{/if}
<main class="container">
  <section>
    <slot />
  </section>
</main>

<section>
  <Footer />
</section>

<style global>
  /* Increase specificity to override the default styles */
  :root:not([data-theme='joe']:not([data-theme='traist'])) {
    --primary: #0c6291;
    --primary-hover: #094a6d;
    --primary-focus: #094a6d;
    --primary-inverse: #fff;
    --form-element-active-border-color: var(--primary);
    --form-element-focus-color: var(--primary-focus);
    --switch-color: var(--primary-inverse);
    --switch-checked-background-color: var(--primary);
    /* This property reserves space for the scrollbar so that the layout doesn't change when the scrollbar appears (previously this was visible when switching to a page with little content, eg: privacy) */
    scrollbar-gutter: stable;
  }
  .hero-header {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 100vh;
  }
</style>
