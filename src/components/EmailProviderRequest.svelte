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
  <div class="flex items-end justify-between">
    <button
      id="email-request"
      onclick={preventDefault(composeEmail)}
      class="md: border-3xl hover-teal rounded-3xl border p-f4 py-f8 md:px-f12">Email Request</button
    >
    <BackHomeButton classes="text-sm px-f4 md:px-f12" />
  </div>
</div>
