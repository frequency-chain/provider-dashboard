import { cleanup, render } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import TransactionStatus from '$components/TransactionStatus.svelte';

describe('TransactionStatus', () => {
  afterEach(() => cleanup());

  it('mounts', () => {
    const { container } = render(TransactionStatus, { showSelf: true, statuses: [] });
    expect(container).toBeInTheDocument();
  });
  it('properly hides and shows itself', () => {});
});
