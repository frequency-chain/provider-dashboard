export const match = (path: string): boolean => {
  return (/mainnet|testnet|localhost/i).test(path);
}
