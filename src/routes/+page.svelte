<script lang="ts">
  import Dashboard from '$components/Dashboard.svelte';
  import BecomeAProvider from '$components/BecomeAProvider.svelte';
  import ProviderLogin from '$components/ProviderLogin.svelte';
  import { pageContent, PageContent } from '$lib/stores/pageContentStore';

  $pageContent = PageContent.Login;

  onMount(() => {
    await createAndConnectToApi(defaultApi);
  })
  useEffect(() => {
    if(user.endpoint !== api.endpoint) {
      //disconnect first from old api
      await createAndConnectToApi(newEndpoint);
    }
  }, [user.endpoint])
</script>

{#if $pageContent === PageContent.Dashboard}
  <Dashboard />
{:else if $pageContent === PageContent.Login}
  <ProviderLogin />
{:else if $pageContent === PageContent.BecomeProvider}
  <BecomeAProvider />
{/if}
