<script lang="ts" generics="T extends { toString: () => string }">
  export let label: string;
  export let id: string = '';
  export let options: T[]; // eslint-disable-line no-undef
  export let value: T | null = null; // eslint-disable-line no-undef
  export let placeholder: string = '';
  export let onChange: (() => void) | undefined = undefined;
  export let formatter: (value: T) => string = (value) => value.toString(); // eslint-disable-line no-undef
</script>

<div class="column relative w-full max-w-[420px]">
  <label class="font-bold" for={id}>{label}</label>
  <select
    {...$$restProps}
    {id}
    bind:value
    on:change={onChange}
    data-test-id={id}
    class="mt-f8 pr-f32 outline-gray3 hover:outline-teal focus-visible:outline-gray3 disabled:outline-gray3 disabled:hover:outline-gray3 disabled:focus-visible:outline-gray3 relative m-0 cursor-pointer appearance-none rounded-md bg-white p-2 align-middle outline outline-1 focus-visible:outline-1 active:outline-1 disabled:cursor-not-allowed"
  >
    <option class="text-gray3" value={null} disabled>{placeholder}</option>
    {#each options as option, index (index)}
      <option value={option}>{formatter(option)}</option>
    {/each}
  </select>
  <div
    class="pointer-events-none absolute top-[72%] right-[10px] h-[12px] w-[12px] -translate-y-1/2 transform bg-black [clip-path:polygon(8%_17%,0%_25%,50%_84%,100%_25%,92%_17%,50%_65%)]"
  ></div>
</div>
