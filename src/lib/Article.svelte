<script lang="ts">
  import truncate from 'truncate-html';
  import { formatDistance } from 'date-fns';
  export let item;
  const {
    metadata: { title, tags, featured_image, slug, date_published },
    path,
    content
  } = item;
</script>

<div class="mb-16 lg:mb-32 pb-8 lg:pb-16 border-b-2 border-brand-grey-50">
  <a sveltekit:prefetch href={path.replace(/\.[^/.]+$/, '')}>
    <div
      class="image mb-8"
      style="background-image: url('uploads/{featured_image}'); padding-top: 42.86%;"
    />
    <div class="w-5/6 lg:w-3/4 mx-auto">
      <h2
        class="text-2xl lg:text-4xl font-black mb-4 hover:text-brand-700 transition-colors duration-300 break-words"
      >
        {title}
      </h2>
    </div></a
  >
  <div class="w-5/6 lg:w-3/4 mx-auto">
    <div class="mb-8 text-brand-grey-300 lowercase">
      {formatDistance(new Date(date_published), new Date(), {
        addSuffix: true
      })}
      {#if tags && tags.length}
        &bull;
        {#if tags instanceof Array}
          {#each tags as tag, i}#{tag}&nbsp;{/each}
        {:else}#{tags}{/if}
      {/if}
    </div>
    {@html truncate(content, 80, { byWords: true, stripTags: true, excludes: '#meta,header' })}
  </div>
</div>

<style>
  .image {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    width: 100%;
  }
</style>
