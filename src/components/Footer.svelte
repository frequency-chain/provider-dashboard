<script lang="ts">
  import { IconButton } from '@frequency-chain/style-guide';
  import XLogo from './icons/XLogo.svelte';
  import DiscordLogo from './icons/DiscordLogo.svelte';
  import FrequencyLogo from './icons/FrequencyLogo.svelte';

  export let privacyHref: string = 'https://www.frequency.xyz/privacy';
  export let type: 'light' | 'dark' = 'light';

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
    class="mx-auto my-0 flex max-w-screen-xl flex-col items-center gap-f16 border-t-[2px] border-current py-f48 md:gap-f32 {fgColorText}"
  >
    <div class="px-0 md:px-f24">
      <FrequencyLogo fill="#000000" width={'192px'} />
    </div>
    <aside
      class="space-between flex flex-col items-center space-y-f8 text-center leading-none md:flex-row md:space-x-f32 md:space-y-1"
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
    <div class="flex gap-f16" aria-label="Social Links">
      <IconButton {type} label="X/Twitter" href={'https://twitter.com/one_frequency'} class="bg-white">
        <XLogo class="w-[40px] p-f4" />
      </IconButton>
      <IconButton {type} label="Discord" href="https://discord.com/invite/JchmHX5afV" class="bg-white">
        <DiscordLogo class="h-[50px] w-[50px] p-f4" />
      </IconButton>
    </div>
  </footer>
</div>
