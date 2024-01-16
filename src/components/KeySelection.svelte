<script lang="ts">
  export let validAccounts = {};
  export let component = '';
  export let selectLabel = 'empty';
  export let selectedOption = '';
  export let onSelect = () => {
    console.log('selectedOption', selectedOption);
  };
  // for styling the dropdown
  export let classOverrides = '';

  console.log('VALID ACCOUNTS', validAccounts);
  console.log('selectedOption ACCOUNTS', selectedOption);
</script>

<p class="text-2xl"><label for={`signing-address-${component}`}>{selectLabel}</label></p>
<div class="{classOverrides} inline-block mt-2">
  <select id={`signing-address-${component}`} bind:value={selectedOption} on:change={onSelect}>
    {#each Object.keys(validAccounts) as address}
      {console.log(validAccounts)}
      {console.log(selectedOption)}
      <option value={address}>{validAccounts[address].meta.name}: {address}</option>
    {/each}
  </select>
</div>
