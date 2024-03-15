import { cleanup, render } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import ActivityLogPreview from '$components/ActivityLogPreview.svelte';

describe('ActivityLogPreview', () => {
  afterEach(() => cleanup());

  it('mounts', () => {
    const { container } = render(ActivityLogPreview, { showSelf: true, statuses: [] });
    expect(container).toBeInTheDocument();
  });
});
