<script lang="ts">
  import { logout } from '$lib/stores';
  import { isLoggedIn } from '$lib/stores';
  import iconLogo from '$lib/assets/icon-logo.png';
  import NavItem from '$components/NavItem.svelte';

  $: url = window.location.pathname;

  const handleLogout = () => {
    logout();
    url = '/';
  };
</script>

<div class="fixed flex h-screen w-[126px] min-w-[126px] flex-col items-center justify-center bg-bg-black">
  <img alt="iconLogo" src={iconLogo} class="absolute left-6 top-7 w-[57px]" />
  <div class="flex w-[100%] flex-col">
    <NavItem href="/" isActive={url === '/'} onClick={() => (url = '/')}>Home</NavItem>
    {#if $isLoggedIn === true}
      <NavItem href="/activity-log" isActive={url === '/activity-log'} onClick={() => (url = '/activity-log')}
        >Activity Log</NavItem
      >
    {/if}
    <NavItem href="/faq" isActive={url === '/faq'} onClick={() => (url = '/faq')}>FAQ's</NavItem>
    {#if $isLoggedIn === true}
      <NavItem id="logout-button" href="/" onClick={handleLogout}>Logout</NavItem>
    {:else}
      <NavItem />
    {/if}
  </div>
</div>
