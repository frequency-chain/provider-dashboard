<script lang="ts">
  import { encodeAvroPayload, getExtension } from '$lib/utils.js';
  import { Button, Input } from '@frequency-chain/style-guide';
  import { user } from '$lib/stores/userStore.js';
  import { submitApplyAddItem } from '$lib/connections.js';
  import { dotApi } from '$lib/stores.js';
  import LoadingIcon from '$lib/assets/LoadingIcon.svelte';
  import { getContentHashAndLatestSchemaForIntent, getSchemaModel } from '$lib/polkadotApi';
  import { hexToU8a } from '@polkadot/util';
  import type { HexString } from '@polkadot/util/types';

  interface Props {
    modalOpen?: boolean | null;
  }

  let { modalOpen = $bindable(null) }: Props = $props();

  let publicKeyHex: string = $state('');
  const hex32BytePattern = /^0x[0-9a-fA-F]{64}$/;
  let isValidPublicKeyHex = $derived(hex32BytePattern.test(publicKeyHex.trim()));

  let isLoading: boolean = $state(false);
  let isSubmitDisabled = $derived(!isValidPublicKeyHex || isLoading);

  let error: string | undefined = $state();
  $effect(() => {
    if (publicKeyHex) error = undefined;
  });

  const addPublicIcsKey = async () => {
    if (!isValidPublicKeyHex) {
      alert('Please enter a valid 32-byte hex public key.');
    } else if (!$user.msaId || !$user.injectedAccount) {
      alert('Invalid provider.');
    } else {
      try {
        isLoading = true;
        const { contentHash, schemaId, intent } = await getContentHashAndLatestSchemaForIntent($dotApi.api!, $user.msaId, 'ics.public-key-key-agreement');
        const model = await getSchemaModel($dotApi.api!, intent, schemaId);
        const publicKeyBytes = hexToU8a(publicKeyHex);
        const payloadHex = encodeAvroPayload({ publicKey: Buffer.from(publicKeyBytes) }, model!);
        await submitApplyAddItem(
          $dotApi.api!,
          await getExtension($user),
          payloadHex as HexString,
          schemaId,
          contentHash,
          $user,
          $user.msaId
        );
        modalOpen = false;
      } catch (err) {
        error = (err as Error).message;
        isLoading = false;
      }
    }
  };
</script>

<form class="column gap-f16">
  <Input
    bind:value={publicKeyHex}
    id="AddIcsKey"
    label="Public ICS Key to Add"
    placeholder="0x..."
    type="text"
    {error}
    disabled={isLoading}
  />

  <Button onclick={addPublicIcsKey} disabled={isSubmitDisabled}>
    {#if isLoading}
      <LoadingIcon />
    {:else}
      Add Control Key
    {/if}</Button
  >
</form>
