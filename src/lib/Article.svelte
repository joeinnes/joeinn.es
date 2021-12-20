<script lang="ts">
  import truncate from 'truncate-html';
  import { formatDistance } from 'date-fns';
  export let item;
  const {
    metadata: { title, tags, image, slug, date_published },
    path,
    content
  } = item;
  const excerpt = truncate(content, 320, {
    byWords: true,
    stripTags: true,
    excludes: '#meta,header'
  });
</script>

<article class="grid">
  <div>
    <img src={image} alt={title} class="image" />
  </div>
  <div class="vertical-stack">
    <hgroup>
      <h1>
        {title}
      </h1>
      <div>
        {#if date_published}
          {date_published &&
            formatDistance(new Date(date_published), new Date(), {
              addSuffix: true
            })}
        {/if}
        {#if tags && tags.length}
          &bull;
          {#if tags instanceof Array}
            {#each tags as tag, i}#{tag}&nbsp;{/each}
          {:else}#{tags}{/if}
        {/if}
      </div>
    </hgroup>

    <div style="flex: 1">
      {@html excerpt}
    </div>
    <div>
      <a sveltekit:prefetch href={path.replace(/\.[^/.]+$/, '').substr(1)} role="button"
        >Read more</a
      >
    </div>
  </div>
</article>

<style>
  img {
    object-fit: cover;
    object-position: center;
    height: 100%;
    aspect-ratio: 4/3;
  }
  article {
    padding: 0;
    overflow: hidden;
    margin-bottom: 2rem;
  }

  article > div:nth-of-type(2) {
    padding: 1rem;
  }

  @media (min-width: 576px) {
    :global(body > main) {
      padding: 1.25rem 0;
    }

    article > div:nth-of-type(2) {
      padding: 1.25rem;
    }

    article {
      margin-bottom: 2.5rem;
    }
  }

  @media (min-width: 768px) {
    :global(body > main) {
      padding: 1.5rem 0;
    }

    article > div:nth-of-type(2) {
      padding: 1.5rem;
    }

    article {
      margin-bottom: 3rem;
    }
  }

  @media (min-width: 992px) {
    :global(body > main) {
      padding: 1.75rem 0;
    }

    article > div:nth-of-type(2) {
      padding: 1.75rem;
    }

    article {
      margin-bottom: 3.5rem;
    }
  }

  @media (min-width: 1200px) {
    :global(body > main) {
      padding: 2rem 0;
    }

    article > div:nth-of-type(2) {
      padding: 2rem;
    }

    article {
      margin-bottom: 4rem;
    }
  }
  .vertical-stack {
    display: flex;
    flex-direction: column;
  }
</style>
