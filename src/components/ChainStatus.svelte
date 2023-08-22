<script lang="ts">
  export let connected = false;
  export let token = 'none';
  export let blockNumber = 0n;
  export let epochNumber = 0n;
</script>

<div id="chain-status"
   class=" p-8 h-22 shadow-md flex justify-between bg-white-transparent rounded-xl font-semibold tracking-wider"
>
  <div class="pr-8 text-2xl self-center">Overview:</div>
  <div class="pr-8">
    <p class="text-lg" id="connection-status-title">Connection status:</p>
    <p class="text-aqua text-2xl" id="connection-status-value">{connected ? 'Connected' : 'Not connected'}</p>
  </div>
  <div>
    <p class="text-lg" id="block-number-title">Current block number:</p>
    <p class="text-2xl text-aqua" id="block-number-value">{blockNumber}</p>
  </div>
  <div>
    <p class="text-lg" id="epoch-number-title">Epoch:</p>
    <p class="text-2xl text-aqua" id="epoch-number-value">{epochNumber}</p>
  </div>
  <div class="pr-8">
    <p class="text-lg" id="token-title">Token:</p>
    <p class="text-2xl text-aqua" id="token-value">{token}</p>
  </div>
</div>
