<script lang="ts">
  import bottomleft from '$lib/assets/bottom-left-bars.png';
  import Dashboard from '$components/Dashboard.svelte';
  import RequestToBeProvider from '$components/RequestToBeProvider.svelte';
  import ProviderLogin from '$components/ProviderLogin.svelte';
  import { pageContent, PageContent } from '$lib/stores';

  $pageContent = PageContent.Login;
</script>

{#if $pageContent === PageContent.Dashboard}
<Dashboard />
{:else if $pageContent === PageContent.Login}
<ProviderLogin />
{:else if $pageContent === PageContent.BecomeProvider}
<RequestToBeProvider />
{/if}
<img alt="decoration-bottom-left" src={bottomleft} class="mt-20 fixed bottom-0 left-8 -z-40"/>
