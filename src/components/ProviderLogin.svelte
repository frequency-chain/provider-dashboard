<script lang="ts">
  import BlockSection from '$components/BlockSection.svelte';
  import LoginForm from './LoginForm.svelte';
  import HowToTransact from '$components/HowToTransact.svelte';
  import { Button } from '@frequency-chain/style-guide';
  import { goto } from '$app/navigation';
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
      class="text-sm underline"
      >Want to learn more about providers?
    </a>
    <!-- TODO: remove div on button width fix -->
    <div>
      <Button type="primary" class="w-fit" onclick={() => goto('/become-a-provider')}>Become a Provider</Button>
    </div>
  </div></BlockSection
>

<BlockSection title="Need tokens?">
  <HowToTransact additionalStyles="text-sm" />
</BlockSection>
