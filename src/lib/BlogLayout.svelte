<script lang="javascript">
  import { formatDistance } from 'date-fns';
  export let title = '';
  export let date_published = '';
  export let published = true;
  export let image = '';
  export let tags = '';
</script>

<svelte:head>
  <title>{import.meta.env.VITE_SITE_NAME} | {title}</title>
</svelte:head>

{#if !published}Whoops! This post has not been published...{:else}
  <hgroup id="meta">
    <h2>{title}</h2>
    <span>
      {date_published &&
        formatDistance(new Date(date_published), new Date(), {
          addSuffix: true
        })}
      {#if tags && tags.length}
        &bull;
        {#if Array.isArray(tags)}
          {#each tags as tag}&#35;{tag}&nbsp;{/each}
        {:else}&#35;{tags}{/if}
      {/if}
    </span>
  </hgroup>
  {#if image}
    <figure style="width:100%;">
      <img src={image} alt={title} style="width:100%;" />
    </figure>
  {/if}

  <slot />
{/if}
