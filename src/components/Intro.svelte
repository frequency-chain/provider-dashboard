<script lang="ts">
  export let dismissed = false;
  const hide = (evt: Event) => {
    dismissed = true;
  };
</script>

<div class:hidden={dismissed}>
  <p>
    Frequency enables users to have control over their own data. While providers can send and receive messages on behalf
    of users, there is need for separation of control via delegator &rAarr; provider, provider &lrhar; delegator
    relationships in form of Permissions and Grants, respectively.
  </p>
  <p>Click OK to get started.</p>
  <button on:click|preventDefault={hide} on:keydown|preventDefault={hide}>Ok</button>
</div>
