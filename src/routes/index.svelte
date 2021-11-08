<script context="module" lang="ts">
  import { browser } from '$app/env';
  let posts = [];
  let pageSize = 5;

  /* Note for future Joe who might be thinking this is unnecessary. You are wrong. It *is* necessary to load ALL posts from the server. Why?! I hear you ask, silently. Surely that's not the most efficient way to do it! Well, the reason is that if the posts are not all loaded from the server, then you won't be able to load the next page. This is because the static renderer needs to know what's on each page. */

  export async function load({ fetch }) {
    const getPosts = async () => {
      const res = await fetch(`/posts.json`);
      const posts = await res.json();
      return posts;
    };

    const postData = await getPosts();
    posts = postData.posts;
    return {
      props: {
        posts
      }
    };
  }
</script>

<script lang="ts">
  import { currentPage } from '$lib/store/currentPage';
  import Pagination from '$lib/Pagination.svelte';
  import Article from '$lib/Article.svelte';

  let items = [];

  let pageCount = Math.ceil(posts.length / pageSize);

  $: {
    items = posts.slice(($currentPage - 1) * pageSize, ($currentPage - 1) * pageSize + pageSize);
    if (browser) {
      document.body.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }
</script>

<main class="article-list">
  {#each items as item (item.path)}
    <article>
      <Article {item} />
    </article>
  {/each}
</main>

<Pagination bind:pageCount />
