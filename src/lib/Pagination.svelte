<script lang="ts">
  export let currentPage: number = 1;
  export let pageCount: number = 0;
</script>

<nav class="grid">
  <div>
    {#if currentPage > 1}
      <a href="/page/{currentPage - 1}" sveltekit:prefetch> Prev </a>
    {/if}
  </div>
  <div>
    Page {currentPage} of {pageCount}
  </div>

  <div>
    {#if currentPage < pageCount}
      <a href="/page/{currentPage + 1}" sveltekit:prefetch> Next </a>
    {/if}
  </div>
</nav>

<style>
  .grid {
    text-align: center;
  }
  a:focus {
    color: var(--primary-inverse);
  }
</style>
