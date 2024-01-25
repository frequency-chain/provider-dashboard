<script>
  import logo from '$lib/assets/logo.png';
  import ConnectionStatus from './ConnectionStatus.svelte';
</script>

<header class="mb-14 flex items-start justify-between">
  <div>
    <img alt="The project logo" src={logo} class="h-11" />
    <p class="text-md pl-3 font-semibold tracking-wider">Provider Dashboard</p>
  </div>
  <ConnectionStatus />
</header>
