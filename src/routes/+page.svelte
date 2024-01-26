<script lang="ts">
  import Dashboard from '$components/Dashboard.svelte';
  import RequestToBeProvider from '$components/RequestToBeProvider.svelte';
  import ProviderLogin from '$components/ProviderLogin.svelte';
  import { pageContent, PageContent } from '$lib/stores/pageContentStore';

  $pageContent = PageContent.Login;
</script>

{#if $pageContent === PageContent.Dashboard}
  <Dashboard />
{:else if $pageContent === PageContent.Login}
  <ProviderLogin />
{:else if $pageContent === PageContent.BecomeProvider}
  <RequestToBeProvider />
{/if}
