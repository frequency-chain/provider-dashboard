<script lang="ts">
  import BlockSection from '$components/BlockSection.svelte';
  import LoginForm from './LoginForm.svelte';
  import HowToTransact from '$components/HowToTransact.svelte';
  import { Button } from '@frequency-chain/style-guide';
</script>

<BlockSection title="Provider Login">
  <LoginForm />
</BlockSection>

<BlockSection title="Not a Provider?">
  <div class="column gap-f16">
    <a
      href="https://docs.frequency.xyz/Delegation/Providers.html"
      target="_blank"
      rel="no-referrer"
      class="underline text-sm"
      >Want to learn more about providers?
    </a>
    <Button class="px-f12 py-f8" href="/become-a-provider">Become a Provider</Button>
  </div>
</BlockSection>
<BlockSection title="Need tokens?">
  <HowToTransact additionalStyles="text-sm" />
</BlockSection>
