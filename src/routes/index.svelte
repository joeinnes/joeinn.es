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
    <h1 class="headline text-8xl leading-relaxed font-black mb-4">Joe Innes</h1>
    <div class="article-list">
      {#each items as { metadata: { title, tags, featured_image, slug }, path, content }}
        <div class="mb-4">
          <a sveltekit:prefetch href={path.replace(/\.[^/.]+$/, '')}
            ><h2 class="text-3xl">{title}</h2></a
          >
          <div class="image" style="background-image: url('uploads/{featured_image}')" />
          {@html truncate(content, 30, { byWords: true })}
        </div>
      {/each}
    </div>
  </article>
</main>

<style>
  .image {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    width: 100%;
    padding-bottom: 56.25%;
  }
</style>
