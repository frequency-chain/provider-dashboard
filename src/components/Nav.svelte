<script lang="ts">
  import { user } from '$lib/stores/userStore';
  import { Account } from '$lib/stores/accountsStore';
  import { dotApi } from '$lib/stores';
  import { onMount } from 'svelte';
  import iconLogo from '$lib/assets/icon-logo.png';
  import { defaultDotApi } from '$lib/storeTypes';
  import { pageContent } from '$lib/stores/pageContentStore';

  let url = '';
  onMount(() => (url = window.location.pathname));

  let navItems = [
    { name: 'Home', href: '/', isActive: url === '/' },
    { name: "FAQ's", href: '/faq', isActive: url === '/faq' },
    { name: 'Logout', href: '', isActive: false },
  ];

  function showActive(curItem: { name: string; href: string; isActive: boolean }) {
    const items = navItems.map((item) => {
      return { ...item, isActive: item.name === curItem.name };
    });
    navItems = items;
  }

  function logout() {
    $user = new Account();
    $dotApi = defaultDotApi;
    pageContent.login();
  }

  function handleClick(curItem: { name: string; href: string; isActive: boolean }) {
    showActive(curItem);
    if (curItem.name === 'Logout') {
      logout();
    }
  }
</script>

<div class="fixed flex h-screen w-[126px] min-w-[126px] flex-col items-center justify-center bg-bg-black">
  <img alt="iconLogo" src={iconLogo} class="absolute left-6 top-7 w-[57px]" />
  <div class="flex w-[100%] flex-col">
    {#each navItems as navItem}
      <a
        on:click|preventDefault={() => handleClick(navItem)}
        href={navItem.href}
        class={` flex h-[100px] items-center justify-center text-sm font-bold ${
          navItem.isActive && 'bg-bg-black-active shadow-blue-border'
        }`}>{navItem.name}</a
      >
    {/each}
  </div>
</div>
