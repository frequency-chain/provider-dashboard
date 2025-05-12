<script lang="ts">
  import Modal from '../../atoms/Modal.svelte';
  import { user } from '$lib/stores/userStore';
  import { type Account } from '$lib/stores/accountsStore';
  import AddControlKeyForm from './AddControlKeyForm.svelte';
  import AddControlKeyRequirements from './AddControlKeyRequirements.svelte';

  interface Props {
    isOpen: boolean;
    close: () => void;
  }

  let { isOpen = false, close = () => {} }: Props = $props();

  let selectedAccount: Account | null = $state(null);

  function onCancel() {
    selectedAccount = null;
    close();
  }
</script>

<Modal id="add-account-id" {isOpen} close={onCancel}>
  {#snippet title()}
    <span>
      Add Control Key to MSA (<span class="font-light">{$user.msaId}</span>)
    </span>
  {/snippet}

  {#snippet body()}
    <div class="column gap-f16">
      <AddControlKeyForm {onCancel} {selectedAccount} />

      <span class="border-b-divider min-w-full border-b"></span>

      <AddControlKeyRequirements />
    </div>
  {/snippet}
</Modal>
