import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import Stake, { stakeAmount } from '$components/Stake.svelte';

// vitest mocking: TODO: this hides an alert window but doesn't affect the parameters
//                       tested here. It should not be mocked for e2e tests.
globalThis.alert = () => {};

describe('Stake.svelte Unit Tests', () => {
  // TODO: @testing-library/svelte claims to add this automatically but it doesn't work without explicit afterEach
  afterEach(() => cleanup());

  it('Stake component mounts correctly', () => {
    const { container } = render(Stake);
    expect(container).toBeInTheDocument();
  });

  it('Stake input is converted to number', async () => {
    render(Stake);
    const input = screen.queryByRole('input');
    if (input) {
      await fireEvent.input(input, { target: { value: '1' } });
      expect(stakeAmount).toBe(1);
      await fireEvent.input(input, { target: { value: '22' } });
      expect(stakeAmount).toBe(22);
      await fireEvent.input(input, { target: { value: '' } });
      expect(stakeAmount).toBe(0);
    }
  });

  // TODO: we need to mock web3Enable and web3FromSource to test this
  // it('Stake button submits transaction', async () => {
  //   const { container } = render(Stake);
  //   const button = screen.getByRole('button', { name: 'Stake' });
  //   // click button and check that submitStake is called
  //   await fireEvent.click(button);
  //   expect(showTransactionStatus).toBe(true);
  // });

});
