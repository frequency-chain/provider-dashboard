<script lang="ts" generics="T extends { toString: () => string }">
  interface Props {
    label: string;
    id: string;
    options: T[];
    value: T | undefined;
    placeholder?: string;
    onChange?: (() => void) | undefined;
    formatter: (value: T) => string;
    disabled?: boolean;
  }

  let {
    label,
    id = '',
    options,
    value = $bindable(),
    placeholder = '',
    onChange = undefined,
    formatter = (value) => value.toString(),
    disabled = false,
  }: Props = $props();
</script>

<div>
  <label class="label mb-3.5 block" for={id}>{label}</label>
  <select {...$$restProps} {id} bind:value on:change={onChange} data-test-id={id} {disabled}>
    {#if placeholder !== ''}
      <option class="text-disabled" value={null} disabled selected>{placeholder}</option>
    {/if}
    {#each options as option}
      <option value={option} class="bg-white">{formatter(option)}</option>
    {/each}
  </select>
</div>
