import { NetworkType } from '$lib/stores/networksStore';
import { error } from '@sveltejs/kit'

export function load({params}) {
  let network: NetworkType | undefined;
  const networkParam: string = params.network? params.network :  '';
  if (networkParam.match(/^mainnet$/i)) {
      network = NetworkType.MAINNET
  } else if (networkParam.match(/^testnet$/i)) {
      network = NetworkType.TESTNET_PASEO;
  } else if (networkParam.match(/^localhost$/i)) {
      network = NetworkType.LOCALHOST
  } else {
      error(404);
  }
  return { network }
}
