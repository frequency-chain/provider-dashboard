<script lang="ts">
  import { storeMsaInfo } from '$lib/stores';
  import type { MsaInfo } from '$lib/storeTypes';

  let msaInfo: MsaInfo;

  storeMsaInfo.subscribe((info: MsaInfo) => {
    msaInfo = info;
  });
</script>

<div class="flex items-center gap-4">
  <div class="h-[90px] w-[90px] max-w-[90px] rounded-full bg-blue" />
  <div class="flex flex-col gap-1">
    <div class="data-value-lg">{msaInfo?.providerName}</div>
    <div class="text-sm">@user_name</div>
    <div class="text-xs">{msaInfo?.msaId}</div>
  </div>
</div>
