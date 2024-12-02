<script lang="ts" generics="T extends { toString: () => string }">
  interface Props {
    label: string;
    id: string;
    options: T[];
    value: T | null;
    placeholder: string;
    onChange: (() => void) | undefined;
    formatter: (value: T) => string;
  }

  let {
    label,
    id = '',
    options,
    value = null,
    placeholder = '',
    onChange = undefined,
    formatter = (value) => value.toString(),
  }: Props = $props();
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
