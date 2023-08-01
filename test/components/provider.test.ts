import { cleanup, fireEvent, render } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import { storeConnected, storeCurrentAction, storeProviderId } from '../../src/lib/stores';
import Provider from '$components/Provider.svelte';
import { ActionForms } from '../../src/lib/storeTypes';

describe('Provider.svelte', () => {
  afterEach(() => cleanup());

  it('mounts', () => {
    const { container } = render(Provider);
    expect(container).toBeInTheDocument();
  });

  it('is hidden if not connected', () => {
    storeConnected.set(false);
    const { container } = render(Provider);
    const main = container.querySelector('div div');
    expect(main).toHaveClass('hidden');
  });
  it('is not hidden if connected', () => {
    storeConnected.set(true);
    const { container } = render(Provider);
    const main = container.querySelector('div div');
    expect(main.classList.length).toEqual(0);
  });
  it('Says there is no provider if localProvider === 0', () => {
    storeConnected.set(true);
    const { container } = render(Provider);
    const main = container.querySelector('p');
    expect(main.innerHTML).toEqual('Selected Key is not associated with a Provider');
    expect(container.querySelector('button')).toBeNull();
  });
  it('Shows Provider Id if non-zero', () => {
    storeConnected.set(true);
    storeProviderId.set(11);
    const { container } = render(Provider);
    const main = container.querySelector('p');
    expect(main.innerHTML).toEqual('Id: 11');
  });
  it('updates storeCurrentAction when button is clicked', async () => {
    let currentAction: ActionForms = ActionForms.NoForm;
    storeCurrentAction.subscribe((v) => (currentAction = v));
    storeConnected.set(true);
    storeProviderId.set(11);
    const { getByText } = render(Provider);
    await fireEvent.click(getByText('Add control key'));
    expect(currentAction).toEqual(ActionForms.AddControlKey);
  });
});
