<script lang="ts">
  import { pageContent } from '$lib/stores/pageContentStore';
  import { createMailto } from '$lib/utils';

  let mailTo: string = createMailto('hello@frequency.xyz', 'Request to become a Frequency provider', '');

  export let cancelAction = () => {
    pageContent.login();
  };

  function composeEmail() {
    window.location.href = mailTo;
  }
</script>

<div id="mail-request-to-be-provider" class="flex flex-col gap-3.5 text-sm">
  <p>
    For use on Mainnet, anyone with an MSA who wishes to become a Provider needs to send an email request to the
    Frequency Foundation.
  </p>
  <form class="w-350 flex items-end justify-between">
    <button id="email-request-btn" on:click|preventDefault={composeEmail} class="btn-primary">Email Request</button>
    <button on:click|preventDefault={cancelAction} class="btn-no-fill">Cancel</button>
  </form>
</div>
