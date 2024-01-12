<script>
  import Header from '../components/Header.svelte';
  import wave from '$lib/assets/bg-wave.png';
</script>

<div>
  <img alt="The project logo" src={wave} class="fixed w-[100%] top-0 right-0 z-[-1]" />
  <Header />
  <slot class="z-10" />
</div>
;
