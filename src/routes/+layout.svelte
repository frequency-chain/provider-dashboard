<script lang="ts">
  import { logInPromise, dotApi, storeChainInfo, isLoggedIn, logout } from '$lib/stores';
  import { getToken } from '$lib/polkadotApi';
  import { getBlockNumber, getEpoch } from '$lib/connections';
  import { Footer, Header } from '@frequency-chain/style-guide';
  import { base } from '$app/paths';
  import NoExtensionError from '$features/NoExtensionError.svelte';
  import { user } from '$lib/stores/userStore';
  import { subscribeToAccounts } from '$lib/utils';

  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  $effect(() => {
    $logInPromise.then(() => {
      console.info('Set login in promise');
    });
  });

  $effect(() => {
    $dotApi?.api?.rpc.system.properties().then((chain) => {
      if ($dotApi?.api && chain) {
        const token = getToken(chain);
        Promise.all([getBlockNumber($dotApi.api), getEpoch($dotApi.api)])
          .then(([blockNumber, epochNumber]) => {
            storeChainInfo.set({ connected: true, blockNumber, epochNumber, token });
          })
          .catch((error) => {
            console.error(error);
          });
      }
    });
  });

  $effect(() => {
    if ($user.network && $dotApi.api) {
      subscribeToAccounts($user.network, $dotApi.api);
    }
  });

  interface MenuItem {
    label: string;
    href: string;
    isExternal?: boolean;
    isButton?: boolean;
    // Show the active state (buttons only)
    isActive?: boolean;
    // Optional id to highlight if in the viewport
    viewportHighlightId?: string;
    onclick?: () => void;
  }

  const loggedOutMenu = [{ label: "FAQ's", href: '/faq', viewportHighlightId: 'faq', isButton: false }];
  let menuItems = $state<MenuItem[]>(loggedOutMenu);

  $effect(() => {
    const items: MenuItem[] = [...loggedOutMenu];
    if ($isLoggedIn) {
      items.unshift({
        label: 'Activity Log',
        href: '/activity-log',
        viewportHighlightId: 'home',
        isButton: false,
      });
      items.push({
        href: '/',
        label: 'Logout',
        viewportHighlightId: 'logout-button',
        isButton: true,
        onclick: logout,
      });
    }
    menuItems = items;
  });
</script>

<div class="sticky top-0 z-50 mb-4 w-full bg-white">
  <Header highlightMarginTop="-90px" innerClass="mx-auto max-w-[80%]" logoLink={base + '/'} {menuItems} />
</div>
<div class="py-f24 mx-auto min-h-[calc(100vh-436px)] max-w-[80%] px-0 lg:max-w-[1024px]">
  {@render children?.()}
</div>
<div class="mt-f16 md:mt-f96">
  <Footer intent="light" />
</div>
<NoExtensionError />
