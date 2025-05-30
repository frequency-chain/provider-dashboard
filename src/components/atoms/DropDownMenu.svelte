<script lang="ts" generics="T extends { toString: () => string }">
  import LoadingIcon from '$lib/assets/LoadingIcon.svelte';

  interface Props {
    label: string;
    id?: string;
    options: T[];
    value?: T | null;
    placeholder?: string;
    onChange?: (() => void) | undefined;
    formatter?: (value: T) => string;
    getKey?: (item: T) => string;
    isLoading?: boolean;
    disabled?: boolean;
    [key: string]: unknown;
  }

  let {
    label,
    id = '',
    options,
    value = $bindable<T | null>(null),
    placeholder = '',
    onChange = undefined,
    formatter = (value: T) => value.toString(),
    getKey = (item: T) => item.toString(),
    isLoading = false,
    disabled = false,
    ...rest
  }: Props = $props();
</script>

<div class="column freq-select gap-f8">
  <label class="font-bold" for={id}>{label}</label>
  <div class="gap-f12 flex flex-row items-center">
    <select
      {...rest}
      {id}
      bind:value
      onchange={onChange}
      data-test-id={id}
      class="mt-f8 pr-f32 outline-gray3 hover:outline-primary focus-visible:outline-gray3 disabled:outline-gray3 disabled:hover:outline-gray3 disabled:focus-visible:outline-gray3 relative m-0 w-full max-w-[420px] cursor-pointer rounded-md bg-white p-2 align-middle outline focus-visible:outline active:outline disabled:cursor-not-allowed"
      disabled={isLoading || disabled}
    >
      <option class="text-gray3" value={null} disabled>{placeholder}</option>
      {#each options as option}
        <option value={option}>{formatter(option)}</option>
      {/each}
    </select>
    {#if isLoading}
      <LoadingIcon />
    {/if}
    <div class="select-arrow"></div>
  </div>
</div>
