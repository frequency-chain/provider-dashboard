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

<div class="bg-bg-black w-[126px] min-w-[126px] h-screen flex flex-col justify-center items-center">
  <img alt="iconLogo" src={iconLogo} class="w-[57px] absolute top-7 left-6" />
  <div class="flex flex-col w-[100%]">
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
          class={` h-[100px] flex items-center justify-center font-bold text-sm ${
            navItem.isActive && 'bg-bg-black-active shadow-blue-border'
          }`}>{navItem.name}</a
        >
      {/key}
    {/each}
  </div>
</div>
