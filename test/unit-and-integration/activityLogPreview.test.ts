import ActivityLogPreview from '$features/ProfileOverview/ActivityLogPreview.svelte';
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/svelte';

describe('ActivityLogPreview', () => {
  afterEach(() => cleanup());

  it('mounts', () => {
    const { container } = render(ActivityLogPreview);
    expect(container).toBeInTheDocument();
  });
});
