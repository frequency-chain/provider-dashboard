<script lang="ts">
  import { user } from '$lib/stores/userStore';
  import AddToClipboard from '../../atoms/AddToClipboard.svelte';
</script>

<div class="flex flex-col items-center gap-2 md:min-w-[300px] md:flex-row md:gap-4">
  <div
    class="lgText w-f64 h-f64 from-primary to-secondary text-cream flex min-w-[60px] items-center justify-center rounded-full bg-gradient-to-r font-bold md:h-[90px] md:w-[90px] md:max-w-[90px]"
  >
    {$user.providerName ? $user.providerName.substring(0, 1) : $user.address.substring(0, 3) + '…'}
  </div>
  <div class="flex flex-col gap-2">
    <div class="lgText font-bold">{$user.providerName}</div>
    <div class="smText">{$user.msaId}</div>
    <div class="relative flex items-center align-middle">
      <div class="smText leading-3">{$user.address}</div>
      <AddToClipboard classes="ml-2" copyValue={$user.address}></AddToClipboard>
    </div>
  </div>
</div>
