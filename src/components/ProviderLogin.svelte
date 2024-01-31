<script lang="ts">
  import { isLoggedIn } from '$lib/stores';
  import BlockSection from '$components/BlockSection.svelte';
  import LoginForm from './LoginForm.svelte';
  import Button from '$components/Button.svelte';
  import HowToTransact from '$components/HowToTransact.svelte';
  import { pageContent } from '$lib/stores/pageContentStore';

  async function onConnect() {
    $isLoggedIn = true;
    pageContent.dashboard();
  }

  function becomeProvider() {
    pageContent.becomeProvider();
  }
</script>

<div id="provider-login" class="content-block column w-single-block">
  <BlockSection title="Provider Login">
    <LoginForm {onConnect} />
  </BlockSection>

  <BlockSection title="Not a Provider?">
    <div class="text-sm">
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem
      aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    </div>
    <Button id="request-2b-provider-btn" title="Become a Provider" action={becomeProvider} />
  </BlockSection>

  <HowToTransact additionalStyles="mt-24 text-xs gap-1" />
</div>
