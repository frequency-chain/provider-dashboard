<script lang="ts">
  import BackHomeButton from '$atoms/BackHomeButton.svelte';
  import { NetworkType } from '$lib/stores/networksStore';
  import { user } from '$lib/stores/userStore';
  import CreateMsa from './CreateMsa.svelte';
  import CreateProvider from './CreateProvider.svelte';
  import RequestToBeProvider from './RequestToBeProvider.svelte';

  interface Props {
    hasRequestedToBeProvider: boolean;
    isLoading: boolean;
  }

  let { hasRequestedToBeProvider = $bindable(), isLoading = $bindable(false) }: Props = $props();
</script>

{#if $user && $user?.address !== ''}
  {#if $user?.msaId === 0}
    <CreateMsa bind:isLoading />
  {:else if $user?.network?.id === NetworkType.MAINNET}
    <RequestToBeProvider bind:hasRequestedToBeProvider />
  {:else}
    <CreateProvider bind:isLoading />
  {/if}
{:else}
  <BackHomeButton cancelText="Back" />
{/if}
