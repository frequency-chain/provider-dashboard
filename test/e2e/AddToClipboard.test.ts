import { fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { vi } from 'vitest';
import AddToClipboard from '../../src/components/atoms/AddToClipboard.svelte';

describe('AddToClipboard', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('renders with default state', async () => {
    render(AddToClipboard, { copyValue: 'test-value' });
    expect((await screen.findByText('Copied')).classList).toContain('hidden');
  });

  it('copies text and shows "Copied" on click', async () => {
    render(AddToClipboard, { copyValue: 'copy-me' });

    const button = screen.getByRole('button', { name: 'Copy selected address' });
    await fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('copy-me');
    expect(await screen.findByText('Copied')).toBeVisible();
    expect((await screen.findByText('Copied')).classList).not.toContain('hidden');
  });

  it('resets after 2 seconds', async () => {
    vi.useFakeTimers();

    render(AddToClipboard, { copyValue: 'copy-me' });

    const button = screen.getByRole('button', { name: 'Copy selected address' });
    await fireEvent.click(button);

    const copiedSpan = screen.getByText('Copied');

    expect(copiedSpan.classList.contains('hidden')).toBe(false);

    vi.advanceTimersByTime(2000);
    await tick();

    expect(copiedSpan.classList.contains('hidden')).toBe(true);
    vi.useRealTimers();
  });

  it('changes fill on hover', async () => {
    render(AddToClipboard, { copyValue: 'hello' });

    const button = screen.getByRole('button', { name: 'Copy selected address' });
    const svg = button.querySelector('svg')!;

    await fireEvent.mouseEnter(button);
    expect(svg).toHaveAttribute('fill', '#790E70');

    await fireEvent.mouseLeave(button);
    expect(svg).toHaveAttribute('fill', '#000');
  });

  it('logs an error if copy fails', async () => {
    const error = new Error('mock clipboard failure');
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(error),
      },
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(AddToClipboard, { copyValue: 'fail-copy' });

    const button = screen.getByRole('button', { name: 'Copy selected address' });
    await fireEvent.click(button);

    await tick();

    expect(consoleSpy).toHaveBeenCalledWith('Failed to copy: ', error);

    consoleSpy.mockRestore();
  });
});
