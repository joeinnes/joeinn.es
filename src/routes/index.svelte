<script context="module">
  /**
   * @type {import('@sveltejs/kit').Load}
   */
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
  let pageSize = 2;
</script>

<main>
  <article>
    <h1 class="headline text-7xl leading-relaxed font-black font-display mb-4">Hagura - Light!</h1>
    <div class="article-list">
      {#each items as { metadata: { title, description, tags, outline, slug }, path }}
        <div class="mb-4">
          <a sveltekit:prefetch href={path.replace(/\.[^/.]+$/, '')}
            ><h2 class="text-3xl leading-relaxed">{title}</h2></a
          >
          <p>{description}</p>
        </div>
      {/each}
    </div>
  </article>
</main>
