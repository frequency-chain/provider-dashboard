<script lang="ts">
  import { storeMsaInfo } from '$lib/stores';
</script>

<div class="flex items-center gap-4">
  <div
    class="text-2xl text-bold h-[90px] w-[90px] max-w-[90px] rounded-full bg-gradient-to-r to-green from-blue flex items-center justify-center"
  >
    {$storeMsaInfo ? $storeMsaInfo?.providerName.substring(0, 1) : ''}
  </div>
  <div class="flex flex-col gap-1">
    <div class="data-value-lg">{$storeMsaInfo?.providerName}</div>
    <div class="text-sm">{$storeMsaInfo?.msaId}</div>
  </div>
</div>
