<script lang="ts">
  import Dashboard from '$pages/Dashboard.svelte';
  import ProviderLogin from '$pages/ProviderLogin.svelte';
  import { pageContent, PageContent } from '$lib/stores/pageContentStore';
</script>

{#if $pageContent === PageContent.Dashboard}
  <Dashboard />
{:else}
  <ProviderLogin />
{/if}
