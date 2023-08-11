<script lang="ts">
  export let validAccounts = {};
  export let component = '';
  export let selectLabel = 'empty';
  export let selectedOption = '';
  export let onSelect = () => {};
</script>
<div class="pt-8">
  <label for={`signing-address-${component}`}>{selectLabel}</label>
  <select id={`signing-address-${component}`} bind:value={selectedOption} on:change={onSelect}
          class="bg-green5 px-6 py-2 rounded-md border-0">
    {#each Object.keys(validAccounts) as address}
      <option value={address}>{validAccounts[address].meta.name}: {address}</option>
    {/each}
  </select>
</div>
