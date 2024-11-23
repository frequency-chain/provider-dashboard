<script lang="ts">
  import BlockSection from '$components/BlockSection.svelte';
  import LoginForm from './LoginForm.svelte';
  import HowToTransact from '$components/HowToTransact.svelte';
  import { Button } from '@frequency-chain/style-guide';
</script>

<div id="provider-login">
  <BlockSection title="Provider Login">
    <LoginForm />
  </BlockSection>

  <BlockSection title="Not a Provider?">
    <div class="text-sm">
      <a href="https://docs.frequency.xyz/Delegation/Providers.html" target="_blank" rel="no-referrer" class="underline"
        >Want to learn more about providers?
      </a>
    </div>
    <Button href="/become-a-provider">Become a Provider</Button>
  </BlockSection>
  <BlockSection title="Need tokens?">
    <HowToTransact additionalStyles="text-sm" />
  </BlockSection>
</div>
