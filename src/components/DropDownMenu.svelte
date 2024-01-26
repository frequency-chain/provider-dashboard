<script lang="ts">
  export let label: string;
  export let id: string = '';
  export let options: any[];
  export let selected: any;
  export let placeholder: string = '';
  export let onChange: () => void;
  export let formatter: (value: any) => string = (value) => value.toString();
</script>

<div>
  <label class="label mb-3.5 block" for={id}>{label}</label>
  <select {...$$restProps} {id} bind:value={selected} on:change={onChange} class="cursor-pointer">
    {#if placeholder !== ''}
      <option class="text-disabled" value="" disabled selected>{placeholder}</option>
    {/if}
    {#each options as option}
      <option value={option} class="bg-base">{formatter(option)}</option>
    {/each}
  </select>
</div>

<style>
  option[value=''][disabled] {
    display: none;
  }
</style>
