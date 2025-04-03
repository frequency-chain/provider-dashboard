import Intro from '$components/Intro.svelte';
import '@testing-library/jest-dom';
import { fireEvent, render, waitFor } from '@testing-library/svelte';

describe('Intro', () => {
  it('has everything showing by default', () => {
    const { container } = render(Intro);
    expect(container).toBeInTheDocument();
    expect(container.querySelector('div div')).not.toHaveClass('hidden');
  });

  it('accepts a prop that controls hidden class', () => {
    const { container } = render(Intro, { dismissed: true });
    expect(container.querySelector('div div')).toHaveClass('hidden');
  });

  it('clicking the button hides the component content', async () => {
    const { container, getByRole } = render(Intro);
    const dismissButton = getByRole('button', { name: 'Ok' });
    fireEvent.click(dismissButton);
    await waitFor(() => {
      expect(container.querySelector('div div')).toHaveClass('hidden');
    });
  });
});
