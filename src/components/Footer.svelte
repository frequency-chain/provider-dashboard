<script lang="ts">
  import { IconButton } from '@frequency-chain/style-guide';
  import XLogo from './icons/XLogo.svelte';
  import DiscordLogo from './icons/DiscordLogo.svelte';
  import FrequencyLogo from './icons/FrequencyLogo.svelte';

  interface Props {
    privacyHref?: string;
    type?: 'light' | 'dark';
  }

  let { privacyHref = 'https://www.frequency.xyz/privacy', type = 'light' }: Props = $props();

  let fgColorText = {
    dark: 'text-white',
    light: 'text-black',
  }[type];
  let fgColorBg = {
    dark: 'bg-white',
    light: 'bg-black',
  }[type];
</script>

<div class="px-[10px] sm:px-[30px] md:px-[40px] lg:px-[80px]">
  <footer
    class="gap-f16 py-f48 md:gap-f32 mx-auto my-0 flex max-w-screen-xl flex-col items-center border-t-[2px] border-current {fgColorText}"
  >
    <div class="md:px-f24 px-0">
      <FrequencyLogo fill="#000000" width={'192px'} />
    </div>
    <aside
      class="space-between space-y-f8 md:space-x-f32 flex flex-col items-center text-center leading-none md:flex-row md:space-y-1"
    >
      <div>
        © {new Date().getFullYear()} Frequency Network Foundation
      </div>
      <div class="hidden w-[2px] self-stretch md:block {fgColorBg}"></div>
      <div class="hidden md:block">All Rights Reserved</div>
      <div class="hidden w-[2px] self-stretch md:block {fgColorBg}"></div>
      <div>
        <a href={privacyHref} class="md:mr-f16">Privacy&nbsp;Policy</a>
      </div>
    </aside>
    <div class="gap-f16 flex" aria-label="Social Links">
      <IconButton {type} label="X/Twitter" href={'https://twitter.com/one_frequency'}>
        <XLogo />
      </IconButton>
      <IconButton {type} label="Discord" href="https://discord.com/invite/JchmHX5afV">
        <DiscordLogo />
      </IconButton>
    </div>
  </footer>
</div>
