<script lang="ts">
  import Dashboard from '$components/Dashboard.svelte';
  import ProviderLogin from '$components/ProviderLogin.svelte';
  import { pageContent, PageContent } from '$lib/stores/pageContentStore';
</script>

{#if $pageContent === PageContent.Dashboard}
  <Dashboard />
{:else}
  <ProviderLogin />
{/if}
