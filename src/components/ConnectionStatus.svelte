<script lang="ts">
  export let connected = false;
</script>

<div class="flex items-center gap-6">
  <!-- {#if connected} -->
  <!-- TODO: ADD REAL DATA WHEN STORE IS CONNECTED -->
  <div class="flex items-center gap-2">
    <div class="w-1 h-1 rounded-full bg-green-success p-1" />
    <p class="text-md uppercase">name_OF_NETWORK</p>
  </div>
  <p class="text-md">NETWORK_ENDPOINT_URL</p>

  <!-- TODO: CHANGE ICON WHEN APPROVED -->
  <!-- TODO: ADD ONCLICK WHEN BUILDING SWITCH MODAL -->
  <button on:click={() => {}}>SWITCH_ICON</button>
  <!-- {/if} -->
</div>
