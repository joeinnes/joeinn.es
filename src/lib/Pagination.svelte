<script lang="ts">
  export let currentPage: number = 1;
  export let pageCount: number = 0;
</script>

<nav class="flex justify-between md:grid md:grid-cols-3 mb-16 w-5/6 lg:w-full mx-auto">
  <div class="flex justify-start">
    {#if currentPage > 1}
      <a
        href="?page={currentPage - 1}"
        class=" border-2 rounded-full px-4 py-2 hover:bg-brand-700 hover:text-white border-brand-800 bg-white text-black transition-colors duration-300"
        sveltekit:prefetch
      >
        Prev<span class="hidden md:inline">&nbsp;Page</span>
      </a>
    {:else}<div><!--Empty div to ensure flex spacing stays correct--></div>
    {/if}
  </div>
  <div class="flex items-center justify-center text-gray-300">
    <span class="hidden md:inline">Page&nbsp;</span>{currentPage} of {pageCount}
  </div>

  <div class="flex justify-end">
    {#if currentPage < pageCount}
      <a
        href="?page={currentPage + 1}"
        class="border-2 rounded-full px-4 py-2 hover:bg-brand-700 hover:text-white border-brand-800 bg-white text-black transition-colors duration-300"
        sveltekit:prefetch
      >
        Next<span class="hidden md:inline">&nbsp;Page</span>
      </a>
    {:else}<div><!--Empty div to ensure flex spacing stays correct--></div>
    {/if}
  </div>
</nav>
