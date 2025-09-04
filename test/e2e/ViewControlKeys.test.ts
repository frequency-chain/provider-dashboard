import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { Mock, vi } from 'vitest';
import ViewControlKeys from '../../src/components/features/Provider/ViewControlKeys.svelte';
import { getControlKeys } from '../../src/lib/polkadotApi';
import { dotApi } from '../../src/lib/stores';
import { user } from '../../src/lib/stores/userStore';

vi.mock('$lib/polkadotApi', () => ({
  getControlKeys: vi.fn(),
}));

describe('ControlKeys modal', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    dotApi.set({ api: {} } as any);
  });

  it('renders the modal trigger button', () => {
    user.set({ msaId: 123 });
    render(ViewControlKeys);

    expect(screen.getByText('View Control Keys')).toBeDefined();
  });

  it('does not call getControlKeys if user.msaId is falsy', async () => {
    user.set({ msaId: undefined });
    render(ViewControlKeys);

    const button = screen.getByText('View Control Keys');
    await fireEvent.click(button);

    expect(getControlKeys).not.toHaveBeenCalled();
  });

  it('fetches and displays control keys when button clicked', async () => {
    user.set({ msaId: 123 });
    (getControlKeys as Mock).mockResolvedValue(['0xabc', '0xdef']);

    render(ViewControlKeys);

    const button = screen.getByText('View Control Keys');
    await fireEvent.click(button);

    await waitFor(() => {
      expect(getControlKeys).toHaveBeenCalledWith({}, 123);
    });

    expect(await screen.findByText('0xabc')).toBeInTheDocument();
    expect(await screen.findByText('0xdef')).toBeInTheDocument();

    const copyButtons = screen.getAllByRole('button', { name: /copy/i });
    expect(copyButtons).toHaveLength(2);
  });
});
