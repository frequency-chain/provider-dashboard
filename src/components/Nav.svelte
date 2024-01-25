<script lang="ts">
  import { navigating } from '$app/stores';
  import { onMount } from 'svelte';
  import iconLogo from '$lib/assets/icon-logo.png';

  let url = '';
  onMount(() => (url = window.location.pathname));

  $: navItems = [
    { name: 'Home', href: '/', isActive: url === '/' },
    { name: "FAQ's", href: '/faq', isActive: url === '/faq' },
    { name: 'Logout', href: '', isActive: false },
  ];

  //TODO: logout in store once store created
  const logout = () => {};
</script>

<div class="fixed flex h-screen w-[126px] min-w-[126px] flex-col items-center justify-center bg-bg-black">
  <img alt="iconLogo" src={iconLogo} class="absolute left-6 top-7 w-[57px]" />
  <div class="flex w-[100%] flex-col">
    {#each navItems as navItem}
      {#key navItems}
        <a
          on:click={() => {
            const items = navItems.map((item) => {
              return { ...item, isActive: item.name === navItem.name };
            });
            navItems = items;
          }}
          href={navItem.href}
          class={` flex h-[100px] items-center justify-center text-sm font-bold ${
            navItem.isActive && 'bg-bg-black-active shadow-blue-border'
          }`}>{navItem.name}</a
        >
      {/key}
    {/each}
  </div>
</div>
