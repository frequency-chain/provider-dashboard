<script lang="ts">
  import { storeMsaInfo } from '$lib/stores';
  import type { MsaInfo } from '$lib/storeTypes';

  let msaInfo: MsaInfo;

  storeMsaInfo.subscribe((info) => {
    msaInfo = info as MsaInfo;
  });
</script>

<div class="flex items-center gap-4">
  <div
    class="text-2xl text-bold h-[90px] w-[90px] max-w-[90px] rounded-full bg-gradient-to-r to-green from-blue flex items-center justify-center"
  >
    {msaInfo ? msaInfo.providerName.substring(0, 1) : ''}
  </div>
  <div class="flex flex-col gap-1">
    <div class="data-value-lg">{msaInfo?.providerName}</div>
    <div class="text-sm">{msaInfo?.msaId}</div>
  </div>
</div>
