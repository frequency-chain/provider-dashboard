<script lang="ts">
  export let label: string;
  export let id: string = '';
  export let options: Record<string, string>;
  export let selected: string = '';
  export let placeholder: string = '';
  export let onChange = () => {};
  export let onSelect = () => {};
  export let required = false;
  export let disabled = false;
</script>

<div>
  <label class="label block mb-3.5" for={id}>{label}</label>
  <select {id} bind:value={selected} {required} {disabled} on:change={onChange} on:select={onSelect}>
    {#if placeholder !== ''}
      <option class="text-disabled" value="" disabled selected>{placeholder}</option>
    {/if}
    {#each Object.entries(options) as [key, value]}
      <option value={key} class="bg-base">{key}: {value}</option>
    {/each}
  </select>
</div>

<style>
  option[value=''][disabled] {
    display: none;
  }
</style>
