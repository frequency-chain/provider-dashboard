import FAQPage from '$routes/faq/+page.svelte';
import '@testing-library/jest-dom';
import { fireEvent, render, waitFor } from '@testing-library/svelte';

describe('FAQ Page', () => {
  beforeAll(() => {
    // Prevents "element.animate is not a function" errors
    Element.prototype.animate =
      Element.prototype.animate ||
      (() => ({
        finished: Promise.resolve(),
        cancel: () => {},
      }));
  });

  it('mounts', () => {
    const { container, getByText } = render(FAQPage);
    expect(container).toBeVisible();
    expect(getByText("FAQ's")).toBeVisible();
  });

  it('has all answers closed on load', () => {
    const { container } = render(FAQPage);
    const faqAnswers = container.querySelectorAll('[data-accordion-content=""]');
    faqAnswers.forEach((answer) => {
      expect(answer).not.toBeVisible();
    });
  });

  it('clicking the question toggles the answer content', async () => {
    const { container } = render(FAQPage);

    const questionBtn = container.querySelector('[data-accordion-header] button') as HTMLButtonElement;
    expect(questionBtn).toBeInTheDocument();

    const content = container.querySelector('[data-accordion-content]') as HTMLElement;
    expect(content).toBeInTheDocument();

    expect(content).toHaveAttribute('data-state', 'closed');
    expect(content).toHaveAttribute('hidden');
    expect(content).not.toBeVisible();

    await fireEvent.click(questionBtn);

    await waitFor(() => {
      expect(content).toHaveAttribute('data-state', 'open');
      expect(content).not.toHaveAttribute('hidden');
      expect(content).toBeVisible();
    });
  });
});
