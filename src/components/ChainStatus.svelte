<script lang="ts">
  export let connected = false;
  export let token = 'none';
  export let blockNumber = 0n;
  export let epochNumber = 0n;
</script>

<div id="chain-status"
   class=" p-8 h-22 shadow-md flex  bg-white-transparent rounded-xl font-semibold tracking-wider"
>
  <div class="text-2xl self-center text-right pr-16 border-r-2 basis-1/6">Overview:</div>
  <div class="border-r-2 basis-1/5 pl-12 pr-4">
    <p class="text-lg" id="connection-status-title">Connection status:</p>
    <p class="text-aqua text-2xl" id="connection-status-value">{connected ? 'Connected' : 'Not connected'}</p>
  </div>
  <div class="border-r-2 basis-1/4 pl-12 pr-4">
    <p class="text-lg" id="block-number-title">Current block number:</p>
    <p class="text-2xl text-aqua" id="block-number-value">{blockNumber}</p>
  </div>
  <div class="border-r-2 basis-1/6 pl-12 pr-4">
    <p class="text-lg" id="epoch-number-title">Epoch:</p>
    <p class="text-2xl text-aqua" id="epoch-number-value">{epochNumber}</p>
  </div>
  <div class="basis-1/6 pl-12">
    <p class="text-lg" id="token-title">Token:</p>
    <p class="text-2xl text-aqua" id="token-value">{token}</p>
  </div>
</div>
