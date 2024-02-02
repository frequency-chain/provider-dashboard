<script lang="ts" generics="T">
  export let label: string;
  export let id: string = '';
  export let options: T[];
  export let selected: T | null;
  export let placeholder: string | null = null;
  export let onChange: () => void;
  export let formatter: (value: any) => string = (value) => value.toString();

  console.log('selected', selected);
  console.log('options', JSON.stringify(options));
</script>

<div>
  <label class="label mb-3.5 block" for={id}>{label}</label>
  <select {...$$restProps} {id} bind:value={selected} on:change={onChange}>
    {#if placeholder !== ''}
      <option class="text-disabled" value={null} disabled selected>{placeholder}</option>
    {/if}
    {#each options as option}
      <option value={option} class="bg-base">{formatter(option)}</option>
    {/each}
  </select>
</div>
