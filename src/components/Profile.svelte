<script lang="ts">
  import { storeMsaInfo } from '$lib/stores';
</script>

<div class="flex items-center gap-4">
  <div
    class="text-bold flex h-[90px] w-[90px] max-w-[90px] items-center justify-center rounded-full bg-gradient-to-r from-blue to-green text-2xl"
  >
    {$storeMsaInfo ? $storeMsaInfo?.providerName.substring(0, 1) : ''}
  </div>
  <div class="flex flex-col gap-1">
    <div class="data-value-lg">{$storeMsaInfo?.providerName}</div>
    <div class="text-sm">{$storeMsaInfo?.msaId}</div>
  </div>
</div>
