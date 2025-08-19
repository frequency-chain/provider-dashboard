<script lang="ts">
  import AddToClipboard from '$atoms/AddToClipboard.svelte';
  import { getControlKeys } from '$lib/polkadotApi';
  import { Button, Modal } from '@frequency-chain/style-guide';
  import type { ApiPromise } from '@polkadot/api';
  import { user } from '$lib/stores/userStore';
  import { dotApi } from '$lib/stores';

  let controlKeys: string[] = $state([]);

  function handleGetControlKeys() {
    if (!$user.msaId) return;
    getControlKeys($dotApi.api as ApiPromise, $user.msaId).then((keys) => {
      if (keys) controlKeys = keys;
    });
  }
</script>

<Modal title="Control Keys" description={`Keys associated with the logged in provider (MSA ID: ${$user.msaId})`}>
  {#snippet trigger()}
    <Button size="sm" onclick={handleGetControlKeys}>View Control Keys</Button>
  {/snippet}
  {#snippet body()}
    {#each controlKeys as key (key)}
      <div class="gap-f4 items-top pt-f20 flex border-t">
        <div class="font-bold wrap-anywhere">{key}</div>
        <AddToClipboard copyValue={key} />
      </div>
    {/each}
  {/snippet}
</Modal>
