<script lang="ts" generics="T extends { toString: () => string }">
  export let label: string;
  export let id: string = '';
  export let options: T[]; // eslint-disable-line no-undef
  export let value: T | null = null; // eslint-disable-line no-undef
  export let placeholder: string = '';
  export let onChange: (() => void) | undefined = undefined;
  export let formatter: (value: T) => string = (value) => value.toString(); // eslint-disable-line no-undef
</script>

<div>
  <label class="label mb-3.5 block" for={id}>{label}</label>
  <select {...$$restProps} {id} bind:value on:change={onChange} data-test-id={id}>
    {#if placeholder !== ''}
      <option class="text-disabled" value={null} disabled selected>{placeholder}</option>
    {/if}
    {#each options as option}
      <option value={option} class="bg-white">{formatter(option)}</option>
    {/each}
  </select>
</div>
