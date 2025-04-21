<script lang="ts" generics="T extends { toString: () => string }">
  interface Props {
    label: string;
    id?: string;
    options: T[];
    value?: T | null;
    placeholder?: string;
    onChange?: (() => void) | undefined;
    formatter?: (value: T) => string;
    [key: string]: unknown;
  }

  let {
    label,
    id = '',
    options,
    value = $bindable(null),
    placeholder = '',
    onChange = undefined,
    formatter = (value: T) => value.toString(),
    ...rest
  }: Props = $props();
</script>

<div class="column freq-select w-full max-w-[420px]">
  <label class="font-bold" for={id}>{label}</label>
  <select
    {...rest}
    {id}
    bind:value
    onchange={onChange}
    data-test-id={id}
    class="mt-f8 pr-f32 outline-gray3 hover:outline-teal focus-visible:outline-gray3 disabled:outline-gray3 disabled:hover:outline-gray3 disabled:focus-visible:outline-gray3 relative m-0 cursor-pointer rounded-md bg-white p-2 align-middle outline focus-visible:outline
    active:outline
    disabled:cursor-not-allowed"
  >
    <option class="text-gray3" value={null} disabled>{placeholder}</option>
    {#each options as option}
      <option value={option}>{formatter(option)}</option>
    {/each}
  </select>
  <div class="select-arrow"></div>
</div>
