<script lang="ts">
  import Dashboard from '$components/pages/Dashboard.svelte';
  import ProviderLogin from '$components/pages/ProviderLogin.svelte';
  import { pageContent, PageContent } from '$lib/stores/pageContentStore';
</script>

{#if $pageContent === PageContent.Dashboard}
  <Dashboard />
{:else}
  <ProviderLogin />
{/if}
