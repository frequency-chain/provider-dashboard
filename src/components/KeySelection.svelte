<script lang="ts">
  export let validAccounts = {};
  export let component = '';
  export let selectLabel = 'empty';
  export let selectedOption = '';
  export let onSelect = () => {};
  // for styling the dropdown
  export let classOverrides = '';
</script>

<p class="text-2xl"><label for={`signing-address-${component}`}>{selectLabel}</label></p>
<div class="{classOverrides} mt-2 inline-block">
  <select id={`signing-address-${component}`} bind:value={selectedOption} on:change={onSelect}>
    {#each Object.keys(validAccounts) as address}
      <option value={address}>{validAccounts[address].meta.name}: {address}</option>
    {/each}
  </select>
</div>
