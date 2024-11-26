<script lang="ts" generics="T extends { toString: () => string }">
  export let label: string;
  export let id: string = '';
  export let options: T[]; // eslint-disable-line no-undef
  export let value: T | null = null; // eslint-disable-line no-undef
  export let placeholder: string = '';
  export let onChange: (() => void) | undefined = undefined;
  export let formatter: (value: T) => string = (value) => value.toString(); // eslint-disable-line no-undef
</script>

<div class="column mb-f24 w-full max-w-[420px]">
  <label for={id}>{label}</label>
  <select
    {...$$restProps}
    {id}
    bind:value
    on:change={onChange}
    data-test-id={id}
    class="mr-f32 max-w-[420px] rounded-xl align-middle text-black"
  >
    <option value="" class="text-black" disabled selected>{placeholder}</option>
    {#each options as option}
      <option value={option}>{formatter(option)}</option>
    {/each}
  </select>
</div>
