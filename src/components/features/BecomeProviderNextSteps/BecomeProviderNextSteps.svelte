<script lang="ts">
  import BackHomeButton from '$atoms/BackHomeButton.svelte';
  import { NetworkType } from '$lib/stores/networksStore';
  import { user } from '$lib/stores/userStore';
  import CreateMsa from './CreateMsa.svelte';
  import CreateProvider from './CreateProvider.svelte';
  import RequestToBeProvider from './RequestToBeProvider.svelte';

  interface Props {
    hasRequestedToBeProvider: boolean;
  }

  let { hasRequestedToBeProvider = $bindable() }: Props = $props();
</script>

{#if $user && $user?.address !== ''}
  {#if $user?.msaId === 0}
    <CreateMsa />
  {:else if $user?.network?.id === NetworkType.MAINNET}
    <RequestToBeProvider bind:hasRequestedToBeProvider />
  {:else}
    <CreateProvider />
  {/if}
{:else}
  <BackHomeButton cancelText="Back" />
{/if}
