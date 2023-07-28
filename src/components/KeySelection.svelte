<script lang="ts">
  export let validAccounts = {};
  export let component = '';
  export let selectLabel = 'empty';
  export let selectedOption = '';
  export let onSelect = () => {};
</script>

<label for={`signing-address-${component}`}>{selectLabel}</label>
<select id={`signing-address-${component}`} bind:value={selectedOption} on:change={onSelect}>
  {#each Object.keys(validAccounts) as address}
    <option value={address}>{validAccounts[address].meta.name}: {address}</option>
  {/each}
</select>
