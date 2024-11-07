import {networkNameToNetworkInfo } from '../../src/lib/stores/networksStore';

describe('Network Store Test', () => {
  it('networkNameToNetworkInfo works for valid endpoints', () => {
    for (const name of ['Mainnet', 'testnet', 'LoCalHoSt']) {
      const result = networkNameToNetworkInfo(name);
      expect(result).not.toBeUndefined();
    }
  })
  it('throws for invalid endpoints', () => {
    expect(() => {
      networkNameToNetworkInfo('garbage')
    }).toThrowError("Network not found: garbage");
  })
})
