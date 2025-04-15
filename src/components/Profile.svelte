<script lang="ts">
  import { user } from '$lib/stores/userStore';
  import AddToClipboard from './AddToClipboard.svelte';
</script>

<div class="flex flex-col items-center gap-2 md:min-w-[300px] md:flex-row md:gap-4">
  <div
    class="w-f64 h-f64 from-tealDark to-teal flex min-w-[60px] items-center justify-center rounded-full bg-gradient-to-r text-xl text-black md:h-[90px] md:w-[90px] md:max-w-[90px] md:text-2xl"
  >
    {$user.providerName ? $user.providerName.substring(0, 1) : $user.address.substring(0, 3) + '…'}
  </div>
  <div class="flex flex-col gap-2">
    <div class="data-value-md md:data-value-lg">{$user.providerName}</div>
    <div class="text-sm">{$user.msaId}</div>
    <div class="relative flex items-center align-middle">
      <div class="text-sm leading-3">{$user.address}</div>
      <AddToClipboard classes="ml-2" copyValue={$user.address}></AddToClipboard>
    </div>
  </div>
</div>
