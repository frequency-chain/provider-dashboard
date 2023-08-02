import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import '@testing-library/jest-dom';
import Intro from '$components/Intro.svelte';

describe('Intro', () => {
    it("has everything showing by default", () => {
        const { container } = render(Intro);
        expect(container).toBeInTheDocument();
        expect(container.querySelector('div div')).not.toHaveClass('hidden')
    });

    it('accepts a prop that controls hidden class', () => {
        const { container } = render(Intro, { dismissed: true});
        expect(container.querySelector('div div')).toHaveClass('hidden')
    });

    it('clicking the button hides the component content', async () => {
        const { container, getByRole } = render(Intro);
        let dismissButton = getByRole('button', {name: 'Ok'});
        fireEvent.click(dismissButton);
        await waitFor(() => {
            expect(container.querySelector('div div')).toHaveClass('hidden')
        })
    })
})