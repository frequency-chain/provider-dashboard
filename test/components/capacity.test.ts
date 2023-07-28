import {cleanup, render} from '@testing-library/svelte'
import '@testing-library/jest-dom'
import { storeProviderId} from '../../src/lib/stores';
import Capacity from '$components/Capacity.svelte';

describe('Capacity.svelte', () => {
    afterEach(() => cleanup());

    it('mounts', () => {
        const { container } = render(Capacity);
        expect(container).toBeInTheDocument();
    });

    // it('is hidden if the provider id === 0 and shows otherwise', () => {
    //     storeProviderId.set(0);
    //     const { container } = render(Capacity);
    //     expect(container.querySelector('div div').ariaHidden).toBeTruthy();
    //     storeProviderId.set(1);
    //     expect(container.querySelector('div div').ariaHidden).toBeFalsy();
    // });

});