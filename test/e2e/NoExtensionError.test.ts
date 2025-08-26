import { render, screen } from '@testing-library/svelte';
import NoExtensionError from '../../src/components/features/NoExtensionError.svelte';
import { hasExtension } from '../../src/lib/stores/accountsStore';

describe('NoExtensionError', () => {
  beforeEach(() => {
    hasExtension.set(false); // reset before each test
  });

  it('does not render when hasExtension is true', () => {
    hasExtension.set(true);

    render(NoExtensionError);
    const modal = screen.queryByRole('dialog');
    expect(modal).toBeNull();
  });

  it('renders the modal when hasExtension is false', () => {
    render(NoExtensionError);

    const modal = screen.getByRole('dialog');
    expect(modal).toBeDefined();

    expect(screen.getByRole('heading', { name: 'Extension Not Found' })).toBeDefined();
    expect(screen.getByText(/Polkadot\{\.js\} extension not found/i)).toBeDefined();
    expect(screen.getByText(/connect a Polkadot\.js wallet extension/i)).toBeDefined();

    const btn = screen.getByRole('link', {
      name: /how to setup your wallet/i,
    });
    expect(btn).toHaveProperty('href', 'https://polkadot.com/get-started/wallets/');
    expect(btn).toHaveProperty('target', '__blank');
  });
});
