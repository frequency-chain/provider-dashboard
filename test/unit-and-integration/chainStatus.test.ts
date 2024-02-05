import { storeChainInfo } from '../../src/lib/stores';
import { render } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import ChainStatus from '../../src/components/ChainStatus.svelte';

globalThis.alert = () => {};

describe('ChainStatus component', () => {
  it('renders correctly', () => {
    const epochNumber = 1234n;
    const blockNumber = 898989n;
    const token = 'FLARP';
    storeChainInfo.update((val) => val = {...val, epochNumber, blockNumber, token});

    const { container, getByText } = render(ChainStatus);
    expect(getByText('Current Block:')).toBeInTheDocument();
    expect(getByText('Epoch:')).toBeInTheDocument();
    expect(getByText('Token:')).toBeInTheDocument();

    expect(container.querySelector('#block-number-value')).toHaveTextContent(blockNumber.toString());
    expect(container.querySelector('#epoch-number-value')).toHaveTextContent(epochNumber.toString());
    expect(container.querySelector('#token-value')).toHaveTextContent(token);
  });
});
