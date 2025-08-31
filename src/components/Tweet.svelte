<script>
  let {
    tweet = {
      content: "",
      authorName: "",
      authorHandle: "",
      link: "",
      date: "",
    },
  } = $props();
</script>

<a
  href={tweet.link}
  rel="external"
  target="_blank"
  class="mb-4 no-underline not-prose"
>
  <div
    class="w-full p-4 font-light prose prose-lg shadow rounded-xl prose-zinc"
  >
    <div class="flex flex-col items-start justify-between md:flex-row">
      <div>
        <h3 class="text-2xl font-bold">{tweet.authorName ?? ""}</h3>
        <h4 class="opacity-60">{tweet.authorHandle ?? ""}</h4>
      </div>
      <div class="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="#1da1f2"
          viewBox="0 0 16 16"
        >
          <path
            d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"
          />
        </svg>
        <h5 class="hover:underline">
          {tweet.date ?? ""}
        </h5>
      </div>
    </div>
    <p class="prose prose-lg prose-zinc">{@html tweet.content}</p>
  </div>
</a>

<style>
  @reference 'tailwindcss';
  :global(img) {
    @apply rounded-xl;
  }
</style>
