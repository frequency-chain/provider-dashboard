<script lang="ts">
  import { logger } from "@polkadot/util";

  export let label: string;
  export let id: string = '';
  export let options: Record<string, string>;
  export let placeholder: string = '';
  export let selectedValue: string = "";
  export let onChange = () => {};
</script>

<div>
  <label class="label block mb-3.5" for={id}>{label}</label>
  <select bind:value={selectedValue} {...$$restProps} on:change={onChange}>
    {#if placeholder !== ''}
      <option class="text-disabled" value="" disabled selected>{placeholder}</option>
    {/if}
    {#each Object.entries(options) as [key, value]}
      <option value={key} class="bg-base">{value}</option>
    {/each}
  </select>
</div>

<style>
  option[value=''][disabled] {
    display: none;
  }
</style>
