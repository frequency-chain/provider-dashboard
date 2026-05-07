<div>
  <div class="lgText mb-2 font-bold">Requirements</div>
  <ol class="ordered-list smText">
    <li>
      Ensure the new key is a valid Ed25519 public key, and that you've securely stored the seed phrase
      used to generate it.
    </li>
    <li>Paste the public key hex value into the entry form.</li>
    <li>Click 'Add It.'</li>
    <li>This requires 2 signatures: one for the authorization payload, and one to send the transaction.</li>
    <ul class="unordered-list">
      <li>Sign the payload with the current Control Key,</li>
      <li>Sign the transaction with the current Control Key.</li>
    </ul>
  </ol>
</div>
