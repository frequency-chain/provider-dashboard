<script lang="ts">
  import { logout } from '$lib/stores';
  import { isLoggedIn } from '$lib/stores';
  import NavItem from '$components/NavItem.svelte';

  $: url = window.location.pathname;

  const handleLogout = () => {
    logout();
    url = '/';
  };
</script>

<div class="fixed flex h-screen w-[126px] min-w-[126px] flex-col items-center justify-center bg-bg-black">
  <div class="flex w-[100%] flex-col">
    <NavItem href="/" isActive={url === '/'} onClick={() => (url = '/')}>Home</NavItem>
    {#if $isLoggedIn === true}
      <NavItem href="/activity-log" isActive={url === '/activity-log'} onClick={() => (url = '/activity-log')}
        >Activity Log</NavItem
      >
    {/if}
    <NavItem href="/faq" isActive={url === '/faq'} onClick={() => (url = '/faq')}>FAQ's</NavItem>
    {#if $isLoggedIn === true}
      <NavItem href="https://faucet.testnet.frequency.xyz/" target="_blank">Testnet Faucet</NavItem>
      <NavItem id="logout-button" href="/" onClick={handleLogout}>Logout</NavItem>
    {:else}
      <NavItem />
    {/if}
  </div>
</div>
