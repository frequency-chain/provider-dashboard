<script lang="ts">
  export let label: string;
  export let id: string = '';
  export let options: Map<any, string>;
  export let selected: any;
  export let placeholder: string = '';
</script>

<div>
  <label class="label block mb-3.5" for={id}>{label}</label>
  <select {...$$restProps} {id} bind:value={selected}>
    {#if placeholder !== ''}
      <option class="text-disabled" value="" disabled selected>{placeholder}</option>
    {/if}
    {#each options.entries() as [key, value]}
      <option value={key} class="bg-base">{value}</option>
    {/each}
  </select>
</div>

<style>
  option[value=''][disabled] {
    display: none;
  }
</style>
