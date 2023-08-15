<script lang="ts">
  export let connected = false;
  export let token = '';
  export let blockNumber = 0n;
</script>

<div id="connection-status" class="pr-4 border-aqua">
  <h3 class="text-aqua font-bold">Connection status</h3>
  <p>{connected ? 'Connected' : 'Not connected'}</p>
  <p class:hidden={!connected}>Token: <span id="unit">{token}</span></p>
  <p class:hidden={!connected}>Current block number: <span id="current-block">{blockNumber}</span></p>
</div>
