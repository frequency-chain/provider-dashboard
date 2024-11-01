<script lang="ts">
  interface Props {
    validAccounts?: Record<string, { meta: { name: string } }>;
    component?: string;
    selectLabel?: string;
    selectedOption?: string;
    onSelect?: () => void;
    // for styling the dropdown
    classOverrides?: string;
  }

  let {
    validAccounts = {},
    component = '',
    selectLabel = 'empty',
    selectedOption = $bindable(''),
    onSelect = () => {},
    classOverrides = '',
  }: Props = $props();
</script>

<p class="text-2xl"><label for={`signing-address-${component}`}>{selectLabel}</label></p>
<div class="{classOverrides} mt-2 inline-block">
  <select id={`signing-address-${component}`} bind:value={selectedOption} onchange={onSelect}>
    {#each Object.keys(validAccounts) as address}
      <option value={address}>{validAccounts[address].meta.name}: {address}</option>
    {/each}
  </select>
</div>
