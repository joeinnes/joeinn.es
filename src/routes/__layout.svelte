<script>
  import '../styles/tailwind-output.css';
  //import '../style.css';
</script>

<div class="container w-1/2 mx-auto font-body font-light">
  <slot />
</div>

<style>
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    @apply font-black text-green-800;
  }
</style>
