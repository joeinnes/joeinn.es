<script context="module" lang="ts">
  import truncate from 'truncate-html';
  export async function load({ fetch }) {
    const res = await fetch(`/posts.json`);
    const posts = await res.json();

    return {
      props: {
        posts
      }
    };
  }
</script>

<script>
  export let posts;

  let items = posts;
  let currentPage = 1;
  let pageSize = 5;
</script>

<main>
  <article>
    <h1 class="headline text-7xl leading-relaxed font-black font-display mb-4">Joe Innes</h1>
    <div class="article-list">
      {#each items as { metadata: { title, tags, featured_image, slug }, path, content }}
        <div class="mb-4">
          <a sveltekit:prefetch href={path.replace(/\.[^/.]+$/, '')}
            ><h2 class="text-3xl leading-relaxed">{title}</h2></a
          >
          {#if featured_image}
            <img class="mb-4" src={featured_image.url} alt={featured_image.alt} />
          {/if}
          {@html truncate(content, 30, { byWords: true })}
        </div>
      {/each}
    </div>
  </article>
</main>
