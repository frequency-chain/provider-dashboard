<script lang="ts" generics="T extends { toString: () => string }">
  export let label: string;
  export let id: string = '';
  export let options: T[]; // eslint-disable-line no-undef
  export let value: T | null = null; // eslint-disable-line no-undef
  export let placeholder: string = '';
  export let onChange: (() => void) | undefined = undefined;
  export let formatter: (value: T) => string = (value) => value.toString(); // eslint-disable-line no-undef
</script>

<div class="column freq-select w-full max-w-[420px]">
  <label class="font-bold" for={id}>{label}</label>
  <select
    {...$$restProps}
    {id}
    bind:value
    on:change={onChange}
    data-test-id={id}
    class="relative m-0 mt-f8 cursor-pointer rounded-md bg-white p-2 pr-f32 align-middle outline outline-1 outline-gray3 active:outline-1 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gray3 disabled:cursor-not-allowed hover:outline-teal
    disabled:outline-gray3
    disabled:hover:outline-gray3
    disabled:focus-visible:outline-gray3"
  >
    <option class="text-gray3" value={null} disabled>{placeholder}</option>
    {#each options as option}
      <option value={option}>{formatter(option)}</option>
    {/each}
  </select>
  <div class="select-arrow"></div>
</div>

<style lang="postcss">
  .freq-select {
    position: relative;
  }
  .freq-select::after {
    content: '';
    position: absolute;
    pointer-events: none;
    top: 72%;
    right: 10px;
    transform: translate(0, -50%);
    width: 12px;
    height: 12px;
    background-color: #000000;
    clip-path: polygon(8% 17%, 0% 25%, 50% 84%, 100% 25%, 92% 17%, 50% 65%);
  }
  .freq-select select {
    -webkit-appearance: none;
  }
</style>
