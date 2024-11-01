<script lang="ts">
  import { preventDefault } from 'svelte/legacy';

  interface Props {
    dismissed?: boolean;
  }

  let { dismissed = $bindable(false) }: Props = $props();
  const hide = (_evt: Event) => {
    dismissed = true;
  };
</script>

<div class:hidden={dismissed} class="pt-8">
  <p>
    Frequency enables users to have control over their own data. While providers can send and receive messages on behalf
    of users, there is need for separation of control via delegator &rAarr; provider, provider &lrhar; delegator
    relationships in form of Permissions and Grants, respectively.
  </p>
  <p class="pt-6">Click OK to get started.</p>
  <button onclick={preventDefault(hide)} onkeydown={hide} class="btn-primary mt-6 rounded-2xl p-2 px-8 text-white">
    Ok
  </button>
</div>
