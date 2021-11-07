<script lang="javascript">
  import { formatDistance } from 'date-fns';
  export let title = '';
  export let date_published = '';
  export let published = true;
  export let featured_image = '';
  export let tags = '';
</script>

{#if !published}Whoops! This post has not been published...{:else}
  <div class="pt-8 mb-32">
    <div
      class="image mb-8"
      style="background-image: url('{featured_image}'); padding-top: 42.86%;"
    />
    <article class="prose mx-auto">
      <div id="meta">
        <h1>{title}</h1>
        <div class="mb-8 text-brand-grey-300 lowercase">
          {formatDistance(new Date(date_published), new Date(), {
            addSuffix: true
          })}
          {#if tags && tags.length}
            &bull;
            {#if Array.isArray(tags)}
              {#each tags as tag}&#35;{tag}&nbsp;{/each}
            {:else}&#35;{tags}{/if}
          {/if}
        </div>
      </div>
      <slot />
    </article>
  </div>
{/if}

<style>
  .image {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    width: 100%;
  }
</style>
