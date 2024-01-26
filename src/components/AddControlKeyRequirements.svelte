<script lang="ts">
  import Requirements from './Requirements.svelte';
</script>

<Requirements>
  <li>
    Ensure the new control key has a FRQCY balance if you intend to use it for submitting FRQCY or Capacity
    transactions.
  </li>
  <li>If using a wallet, ensure the new control key is imported into your wallet.</li>
  <li>Select the new control key from the dropdown list below.</li>
  <li>Click 'Add It.'</li>
  <li>This requires 3 signatures: two for the authorization payload, and one to send the transaction.</li>
  <ul class="ml-3.5 list-disc">
    <li>Sign with the new control key.</li>
    <li>Sign with the current control key.</li>
    <li>Sign the transaction with the current control key.</li>
  </ul>
</Requirements>
