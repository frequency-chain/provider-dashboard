<script lang="ts">
  import { user } from '$lib/stores/userStore';
</script>

<div class="flex items-center gap-4">
  <div
    class="text-bold flex h-[90px] w-[90px] max-w-[90px] items-center justify-center rounded-full bg-gradient-to-r from-blue to-green text-2xl"
  >
    {$user.providerName ? $user.providerName.substring(0, 1) : ''}
  </div>
  <div class="flex flex-col gap-1">
    <div class="data-value-lg">{$user.providerName}</div>
    <div class="text-sm">{$user.msaId}</div>
  </div>
</div>
