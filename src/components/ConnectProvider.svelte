<script lang="ts">
  export let close = () => {};
  export let isOpen: boolean = false;
  import Modal from '../components/Modal.svelte';
  import DropDownMenu from './DropDownMenu.svelte';
</script>

<Modal id="connect-provider" {close} {isOpen}>
  <div class="flex flex-col gap-7">
    <h2 class="section-title-underlined">Connect Provider</h2>
    <!-- Select a network dropdown goes here -->
    <!-- Should default to current network -->
    <DropDownMenu label="Select a Network" options={['option1']} />

    <!-- Select a control provider key goes here -->
    <!-- Should default to current key -->
    <DropDownMenu label="Select a Control Provider Key" options={['option1', 'option2']} />

    <div class="flex justify-between align-bottom">
      <button class="btn-primary" on:click={close}>Connect</button>
      <button class="btn-no-fill" on:click={close}>Cancel</button>
    </div>
  </div>
</Modal>
