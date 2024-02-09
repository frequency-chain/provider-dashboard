<script lang="ts">
  import Dashboard from '$components/Dashboard.svelte';
  import BecomeAProvider from '$components/BecomeAProvider.svelte';
  import ProviderLogin from '$components/ProviderLogin.svelte';
  import { pageContent, PageContent } from '$lib/stores/pageContentStore';

</script>

{#if $pageContent === PageContent.Dashboard}
  <Dashboard />
{:else if $pageContent === PageContent.Login}
  <ProviderLogin />
{:else if $pageContent === PageContent.BecomeProvider}
  <BecomeAProvider />
{/if}
