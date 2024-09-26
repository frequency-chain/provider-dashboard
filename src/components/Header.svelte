<script>
  import Logo from './Logo.svelte';
  import ConnectionStatus from './ConnectionStatus.svelte';
</script>

<header class="mb-8 flex items-start justify-between">
  <div class="pt-3">
    <div class="max-w-48 pb-1 pl-3">
      <Logo />
    </div>
    <p class="text-md pl-3 font-semibold tracking-wider">Provider Dashboard</p>
  </div>
  <ConnectionStatus />
</header>
