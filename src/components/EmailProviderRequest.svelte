<script lang="ts">
  import { preventDefault } from 'svelte/legacy';
  import { createMailto } from '$lib/utils';
  import BackHomeButton from '$components/BackHomeButton.svelte';

  let mailTo: string = createMailto('hello@frequency.xyz', 'Request to become a Frequency provider', '');

  function composeEmail() {
    window.location.href = mailTo;
  }
</script>

<div id="mail-request-to-be-provider" class="flex flex-col gap-3.5 text-sm">
  <p>
    For use on Mainnet, anyone with an MSA who wishes to become a Provider needs to send an email request to the
    Frequency Foundation.
  </p>
  <form class="flex w-[350px] items-end justify-between">
    <button id="email-request-btn" onclick={preventDefault(composeEmail)} class="btn-primary">Email Request</button>
    <!-- <BackHomeButton /> -->
  </form>
</div>
