import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/svelte';
import ActivityLogPreview from '../../src/components/features/ProfileOverview/ActivityLogPreview.svelte';

describe('ActivityLogPreview', () => {
  afterEach(() => cleanup());

  it('mounts', () => {
    const { container } = render(ActivityLogPreview);
    expect(container).toBeInTheDocument();
  });
});
