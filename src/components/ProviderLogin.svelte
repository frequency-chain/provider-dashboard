<script lang="ts">
  import BlockSection from '$components/BlockSection.svelte';
  import LoginForm from './LoginForm.svelte';
  import Button from '$components/Button.svelte';
  import HowToTransact from '$components/HowToTransact.svelte';
  import { pageContent } from '$lib/stores/pageContentStore';
</script>

<div id="provider-login" class="column content-block w-single-block">
  <BlockSection title="Provider Login">
    <LoginForm />
  </BlockSection>

  <BlockSection title="Not a Provider?">
    <div class="text-sm">
      <a href="https://docs.frequency.xyz/Delegation/Providers.html" target="_blank" rel="no-referrer" class="underline"
        >Want to learn more about providers?
      </a>
    </div>
    <a href="/become-a-provider" data-testid="become-a-provider" class="btn-primary">Become a Provider</a>
  </BlockSection>
  <BlockSection title="Need tokens?">
    <HowToTransact additionalStyles="text-sm" />
  </BlockSection>
</div>
