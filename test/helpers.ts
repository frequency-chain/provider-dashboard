import { screen } from '@testing-library/svelte';

// Helper function to get text that is broken up into multiple elements (->stackExchange)
export const getByTextContent = (text: string) => {
  // Passing custom matcher function to `getByText`
  return screen.getByText((_content, element) => {
    const hasText = (element) => element.textContent === text;
    const elementHasText = hasText(element);
    const childrenDontHaveText = Array.from(element?.children || []).every((child) => !hasText(child));
    return elementHasText && childrenDontHaveText;
  });
};
