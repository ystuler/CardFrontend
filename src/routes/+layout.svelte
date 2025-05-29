<script>
  import Header from '$lib/Header.svelte';
</script>

<Header />

<main>
  <slot />
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #f8f9fa;
  }
  
  main {
    min-height: calc(100vh - 80px);
  }
</style>
