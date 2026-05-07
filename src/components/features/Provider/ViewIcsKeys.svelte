<script lang="ts">
  import AddToClipboard from '$atoms/AddToClipboard.svelte';
  import { getPublicKeys } from '$lib/polkadotApi';
  import { Button, Modal } from '@frequency-chain/style-guide';
  import type { ApiPromise } from '@polkadot/api';
  import { user } from '$lib/stores/userStore';
  import { dotApi } from '$lib/stores';

  let publicKeys: string[] = $state([]);

  function handleGetIcsKeys() {
    if (!$user.msaId) return;
    getPublicKeys($dotApi.api as ApiPromise, $user.msaId, 'ics.public-key-key-agreement').then((keys) => {
      if (keys) publicKeys = keys;
    });
  }
</script>

<Modal title="ICS Public Keys" description={`ICS Public Keys associated with the logged in provider (MSA ID: ${$user.msaId})`}>
  {#snippet trigger()}
    <Button size="sm" onclick={handleGetIcsKeys}>View ICS Keys</Button>
  {/snippet}
  {#snippet body()}
    {#each publicKeys as key (key)}
      <div class="gap-f4 items-top pt-f20 flex border-t">
        <div class="font-bold wrap-anywhere">{key}</div>
        <AddToClipboard copyValue={key} />
      </div>
    {/each}
  {/snippet}
</Modal>
