<script context="module" lang="ts">
  let currentPage = 1;
  let posts = [];
  let pageSize = 5;

  export async function load({ fetch, page }) {
    currentPage = parseInt(page.params.page, 10) || 1;

    const getPosts = async (start: number, limit: number) => {
      const res = await fetch(`/posts.json?limit=${limit}&start=${start}`);
      const posts = await res.json();
      return { posts, currentPage };
    };

    const postData = await getPosts((currentPage - 1) * pageSize, pageSize);
    posts = postData.posts;
    currentPage = postData.currentPage;
    return {
      props: {
        posts,
        currentPage
      }
    };
  }
</script>

<script lang="ts">
  import Pagination from '$lib/Pagination.svelte';

  import Article from '$lib/Article.svelte';

  export let posts;
  export let currentPage: number;
  let items = [];

  let pageCount = Math.ceil(posts.count / pageSize);
  $: {
    items = posts.posts;
  }
</script>

<section>
  {#each items as item (item.path)}
    <Article {item} />
  {/each}
</section>

<Pagination bind:currentPage bind:pageCount />
