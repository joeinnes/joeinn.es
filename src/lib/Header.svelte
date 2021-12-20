<script>
  import { theme } from '$lib/store';
  import { browser } from '$app/env';
  let darkMode = false;

  if (browser) {
    if (window.localStorage.getItem('theme')) {
      darkMode = window.localStorage.getItem('theme') === 'dark';
    } else {
      darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  }
  $: {
    if (darkMode) {
      $theme = 'dark';
      browser && window.localStorage.setItem('theme', 'dark');
    } else {
      $theme = 'light';
      browser && window.localStorage.setItem('theme', 'light');
    }
  }
</script>

<svelte:head>
  <link rel="icon" href="/clan-crest-{$theme === 'auto' ? 'light' : $theme}.png" />
</svelte:head>
<header>
  <hgroup>
    <nav>
      <ul>
        <li>
          <h1>
            <a href="/" class="brand">
              {import.meta.env.VITE_SITE_NAME}
            </a>
          </h1>
        </li>
      </ul>
      <!-- From an accessibility perspective, a theme-switch toggle is completely irrelevant -->
      <ul>
        <li><a href="/cv">CV</a></li>
        <!-- Not actually external, but SvelteKit shouldn't try to route this -->
        <li><a href="/privacy">Privacy</a></li>
        <li><a href="/rss.xml" rel="external">RSS</a></li>
        <li aria-hidden="true">
          <fieldset>
            Light
            <input
              type="checkbox"
              id="switch"
              name="switch"
              role="switch"
              bind:checked={darkMode}
            />
            Dark
          </fieldset>
        </li>
      </ul>
    </nav>
    <nav />
  </hgroup>
</header>

<style>
  .brand {
    color: inherit;
  }
  a:focus {
    background: none;
  }
</style>
