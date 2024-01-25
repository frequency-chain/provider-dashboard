<script lang="ts">
 // export let connected = false;
</script>

<div class="flex gap-6 items-center">
  <!-- {#if connected} -->
  <!-- TODO: ADD REAL DATA WHEN STORE IS CONNECTED -->
  <div class="flex gap-2 items-center">
    <div class="bg-green-success h-1 w-1 p-1 rounded-full" />
    <p class="text-md uppercase">name_OF_NETWORK</p>
  </div>
  <p class="text-md">NETWORK_ENDPOINT_URL</p>

  <!-- TODO: CHANGE ICON WHEN APPROVED -->
  <!-- TODO: ADD ONCLICK WHEN BUILDING SWITCH MODAL -->
  <button on:click={() => {}}>SWITCH_ICON</button>
  <!-- {/if} -->
</div>