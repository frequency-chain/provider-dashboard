<script lang="ts">
  export let validAccounts = {};
  export let component = '';
  export let selectLabel = 'empty';
  export let selectedOption = '';
  export let onSelect = () => {};
  // for styling the dropdown
  export let classOverrides = '';
</script>

<p class="text-lg"><label for={`signing-address-${component}`}>{selectLabel}</label></p>
<div class="{classOverrides} inline-block mt-2">
  <select id={`signing-address-${component}`}
          bind:value={selectedOption}
          on:change={onSelect}
          class="text-black px-6 py-2 rounded-md border-0 pr-10"
  >
    {#each Object.keys(validAccounts) as address}
      <option value={address}>{validAccounts[address].meta.name}: {address}</option>
    {/each}
  </select>
</div>
