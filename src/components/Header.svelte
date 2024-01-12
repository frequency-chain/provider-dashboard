<script>
  import logo from '$lib/assets/logo.png';
  import ConnectionStatus from './ConnectionStatus.svelte';
</script>

<header class="flex items-start justify-between">
  <div>
    <img alt="The project logo" src={logo} class="h-11" />
    <p class="text-md font-semibold tracking-wider pl-3">Provider Dashboard</p>
  </div>
  <ConnectionStatus />
</header>
