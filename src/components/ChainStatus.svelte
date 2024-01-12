<script lang="ts">
  export let connected = false;
  export let token = 'none';
  export let blockNumber = 0n;
  export let epochNumber = 0n;
</script>

<div
  id="chain-status"
  class="p-8 h-fit shadow-md flex items-stretch bg-bg-black rounded-xl font-semibold tracking-wider"
>
  <div class="text-3xl self-center text-right border-r-2 pr-10 pl-4">
    <div class="height-fit">Overview:</div>
  </div>
  <div class="border-r-2 px-8 grow shrink-0">
    <p class="text-lg" id="connection-status-title">Connection status:</p>
    <p class="text-aqua text-3xl" id="connection-status-value">{connected ? 'Connected' : 'Not connected'}</p>
  </div>
  <div class="border-r-2 basis-1/4 px-8">
    <p class="text-lg" id="block-number-title">Current Block:</p>
    <p class="text-3xl text-aqua" id="block-number-value">{blockNumber}</p>
  </div>
  <div class="border-r-2 basis-1/6 px-8">
    <p class="text-lg" id="epoch-number-title">Epoch:</p>
    <p class="text-3xl text-aqua" id="epoch-number-value">{epochNumber}</p>
  </div>
  <div class="basis-1/6 pl-8">
    <p class="text-lg" id="token-title">Token:</p>
    <p class="text-3xl text-aqua" id="token-value">{token}</p>
  </div>
</div>
