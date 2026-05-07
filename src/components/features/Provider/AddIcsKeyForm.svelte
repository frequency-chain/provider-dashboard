<script lang="ts">
  import { encodeAvroPayload, getExtension } from '$lib/utils.js';
  import { Button, Input, Modal } from '@frequency-chain/style-guide';
  import { user } from '$lib/stores/userStore.js';
  import { submitApplyAddItem } from '$lib/connections.js';
  import { dotApi } from '$lib/stores.js';
  import LoadingIcon from '$lib/assets/LoadingIcon.svelte';
  import { getContentHashAndLatestSchemaForIntent, getSchemaModel } from '$lib/polkadotApi';
  import { hexToU8a, u8aToHex } from '@polkadot/util';
  import type { HexString } from '@polkadot/util/types';
  import { generateSubstrateKeypair } from '$lib/generateSubstrateIcsKey.js';
  import { Buffer } from 'buffer';

  interface Props {
    modalOpen?: boolean | null;
  }

  let { modalOpen = $bindable(null) }: Props = $props();

  let publicKeyHex: string = $state('');
  const hex32BytePattern = /^0x[0-9a-fA-F]{64}$/;
  let isValidPublicKeyHex = $derived(hex32BytePattern.test(publicKeyHex.trim()));

  let isLoading: boolean = $state(false);
  let isSubmitDisabled = $derived(!isValidPublicKeyHex || isLoading);
  let isGenerating: boolean = $state(false);

  let seedPhraseModalOpen: boolean = $state(false);
  let acknowledgeSavedPhrase: boolean = $state(false);
  let generatedSeedPhrase: string = $state('');
  let generatedPublicKeyHex: string = $state('');

  let error: string | undefined = $state();
  $effect(() => {
    if (publicKeyHex) error = undefined;
  });

  const generateKeypair = async () => {
    try {
      isGenerating = true;
      acknowledgeSavedPhrase = false;
      const [{ publicKey }, mnemonic] = await generateSubstrateKeypair();
      generatedSeedPhrase = mnemonic;
      generatedPublicKeyHex = u8aToHex(publicKey);
      seedPhraseModalOpen = true;
    } catch (err) {
      error = (err as Error).message;
    } finally {
      isGenerating = false;
    }
  };

  const closeSeedPhraseModal = () => {
    if (!acknowledgeSavedPhrase) return;
    publicKeyHex = generatedPublicKeyHex;
    seedPhraseModalOpen = false;
  };

  const addPublicIcsKey = async () => {
    if (!isValidPublicKeyHex) {
      alert('Please enter a valid 32-byte hex public key.');
    } else if (!$user.msaId || !$user.injectedAccount) {
      alert('Invalid provider.');
    } else {
      try {
        if (!$dotApi.api) {
          throw new Error("Null or undefined API object");
        }
        isLoading = true;
        const { contentHash, schemaId, intent } = await getContentHashAndLatestSchemaForIntent($dotApi.api, $user.msaId, 'ics.public-key-key-agreement');
        const model = await getSchemaModel($dotApi.api, intent, schemaId);
        const publicKeyBytes = hexToU8a(publicKeyHex);
        const payloadHex = encodeAvroPayload({ publicKey: Buffer.from(publicKeyBytes) }, model);
        await submitApplyAddItem(
          $dotApi.api,
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

  <div class="flex gap-2">
    <Button onclick={generateKeypair} disabled={isLoading || isGenerating}>
      {#if isGenerating}
        <LoadingIcon />
      {:else}
        Generate Keypair
      {/if}
    </Button>

    <Button onclick={addPublicIcsKey} disabled={isSubmitDisabled || isGenerating}>
      {#if isLoading}
        <LoadingIcon />
      {:else}
        Add Public Key
      {/if}</Button
    >
  </div>
</form>

<Modal
  id="generated-ics-keypair-modal"
  title="Generated ICS Keypair"
  open={seedPhraseModalOpen}
  onOpenChange={(val: boolean) => (seedPhraseModalOpen = val)}
>
  {#snippet body()}
    <div class="column gap-f16">
      <div class="smText">
        Record this seed phrase securely before closing. It will not be shown again after this dialog is closed.
      </div>

      <div class="rounded-sm border p-3 font-mono break-words">{generatedSeedPhrase}</div>

      <label class="flex items-start gap-2">
        <input type="checkbox" bind:checked={acknowledgeSavedPhrase} />
        <span class="smText">
          I have securely recorded the seed phrase and understand it cannot be regenerated or displayed again once closed.
        </span>
      </label>

      <div class="flex justify-end">
        <Button onclick={closeSeedPhraseModal} disabled={!acknowledgeSavedPhrase}>Close</Button>
      </div>
    </div>
  {/snippet}
</Modal>
