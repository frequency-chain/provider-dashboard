<script lang="ts">
  export let dismissed = false;
  const hide = (evt: Event) => {
    dismissed = true;
  };
</script>

<div class:hidden={dismissed}>
    <p>Frequency enables users to have control over their own data.
        While providers can send and receive messages on behalf of users,
        there is need for separation of control via
        delegator &rAarr; provider,
        provider &lrhar; delegator relationships in form of Permissions and Grants,
        respectively.</p>
    <p class="pt-6">Click OK to get started.</p>
    <button on:click|preventDefault={hide}  on:keydown={hide}
            class="mt-6 px-8 p-2 rounded-2xl text-white border-black bg-cobalt">
        Ok
    </button>
</div>
