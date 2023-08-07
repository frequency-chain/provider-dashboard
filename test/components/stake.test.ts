import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import { storeConnected } from '$lib/stores';
import Connect from '$components/Stake.svelte';
import { getByTextContent } from '../helpers';

// vitest mocking: TODO: this hides an alert window but doesn't affect the parameters
//                       tested here. It should not be mocked for e2e tests.
globalThis.alert = () => {};

describe('Stake.svelte Unit Tests', () => {
  // TODO: @testing-library/svelte claims to add this automatically but it doesn't work without explicit afterEach
  afterEach(() => cleanup());

  it('Stake component mounts correctly', () => {
    const { container } = render(Stake);
    expect(container).toBeInTheDocument();
  });
});

