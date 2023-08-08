import {dotApi, storeCurrentAction} from "../../src/lib/stores";
import {ActionForms, DotApi} from "../../src/lib/storeTypes";
import {fireEvent, render, waitFor} from "@testing-library/svelte";
import CreateProvider from "../../src/components/CreateProvider.svelte";

describe("CreateProvider component", () => {
    describe("when currentAction != 'me'", () => {
        it("is hidden", () => {})
    })
    describe("when currentAction === 'me'", () => {
        it("shows", () => {

        })
    })

})