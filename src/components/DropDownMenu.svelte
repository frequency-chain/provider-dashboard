<script lang="ts" generics="T">
  export let label: string;
  export let id: string = '';
  export let options: T[]; // eslint-disable-line no-undef
  export let value: T | null = null; // eslint-disable-line no-undef
  export let placeholder: string = '';
  export let onChange: (() => void) | undefined = undefined;
  export let formatter: (value: any) => string = (value) => value.toString();
</script>

<div>
  <label class="label mb-3.5 block" for={id}>{label}</label>
  <select {...$$restProps} {id} bind:value on:change={onChange}>
    {#if placeholder !== ''}
      <option class="text-disabled" value={null} disabled selected>{placeholder}</option>
    {/if}
    {#each options as option}
      <option value={option} class="bg-base">{formatter(option)}</option>
    {/each}
  </select>
</div>
