<script lang="ts">
  export let label: string;
  export let id: string;
  export let options: Record<string, string>;
  export let selected: string;
  export let placeholder: string;
  export let onChange = () => {};
  export let onSelect = () => {};
  export let required = false;
</script>

<label class="section-title" for={id}>{label}</label>

<div style="margin-bottom: 14px;"></div>

<select {id} bind:value={selected} {required} on:change={onChange} on:select={onSelect} class="dropdown">
  {#if placeholder}
    <option value="" disabled selected>{placeholder}</option>
  {/if}
  {#each Object.keys(options) as option}
    <option value={option} class="bg-base">{option}: {options[option]}</option>
  {/each}
</select>
