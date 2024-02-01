import { fireEvent, render, waitFor } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import FAQPage from '$routes/faq/+page.svelte';

describe('FAQ Page', () => {
  it('mounts', () => {
    const { container, getByText } = render(FAQPage);
    expect(container).toBeInTheDocument();
    expect(getByText("FAQ's")).toBeInTheDocument();
  });

  it('has all answers closed on load', () => {
    const { container } = render(FAQPage);
    const faqAnswers = container.querySelectorAll('#faq-answer');
    faqAnswers.forEach((answer) => {
      expect(answer).toHaveClass('hidden');
    });
  });

  it('clicking the question shows the answer content', async () => {
    const { container } = render(FAQPage);
    const questionBtn = container.querySelector('#faq-question');
    const answer = container.querySelector('#faq-answer');
    expect(answer).toHaveClass('hidden');
    questionBtn && fireEvent.click(questionBtn);
    await waitFor(() => {
      expect(answer).toHaveClass('block');
    });
  });

  it('clicking the question twice hides the hides answer content', async () => {
    const { container } = render(FAQPage);
    const questionBtn = container.querySelector('#faq-question');
    const answer = container.querySelector('#faq-answer');
    expect(answer).toHaveClass('hidden');
    questionBtn && fireEvent.click(questionBtn);
    await waitFor(() => {
      expect(answer).toHaveClass('block');
    });
    questionBtn && fireEvent.click(questionBtn);
    await waitFor(() => {
      expect(answer).toHaveClass('hidden');
    });
  });
});
