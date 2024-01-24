<script>
  import Header from '../components/Header.svelte';
  import Nav from '../components/Nav.svelte';
  import wave from '$lib/assets/bg-wave.png';
</script>

<div>
  <img alt="The project logo" src={wave} class="fixed right-0 top-0 z-[-1] w-[100%]" />
  <div class="flex">
    <Nav />
    <div class="m-6 w-[100%] pl-[126px]">
      <Header />
      <slot class="z-10" />
    </div>
  </div>
</div>
;
