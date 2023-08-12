<script lang="ts">
  export let validAccounts = {};
  export let component = '';
  export let selectLabel = 'empty';
  export let selectedOption = '';
  export let onSelect = () => {};
  // for styling the dropdown
  export let classOverrides = '';
</script>

<div class="mt-8">
  <h3 class="text-lg"><label for={`signing-address-${component}`}>{selectLabel}</label></h3>
  <div class="{classOverrides} inline-block">
    <select id={`signing-address-${component}`} bind:value={selectedOption} on:change={onSelect}>
      {#each Object.keys(validAccounts) as address}
        <option value={address}>{validAccounts[address].meta.name}: {address}</option>
      {/each}
    </select>
  </div>
</div>
