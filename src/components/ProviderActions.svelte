<script lang="ts">
    import RequestToBeProvider from "./RequestToBeProvider.svelte";
    import CreateProvider from "./CreateProvider.svelte";
    import AddControlKey from "$components/AddControlKey.svelte";
    import {ActionForms} from "$lib/storeTypes.js";
    import type {MsaInfo} from '$lib/storeTypes';

    import {storeCurrentAction, storeMsaInfo, transactionSigningAddress, storeValidAccounts} from "$lib/stores.js";

    let msaInfo: MsaInfo = {isProvider: false, msaId: 0, providerName: ''};
    let currentAction: ActionForms = ActionForms.NoForm;
    let localSigningAddress = '';
    let validAccounts: Array<string> = [];

    storeCurrentAction.subscribe((val) => (currentAction =val));
    storeMsaInfo.subscribe((info: MsaInfo) => msaInfo = info);
    storeValidAccounts.subscribe((accts: Array<string>) => validAccounts = accts);
    transactionSigningAddress.subscribe(addr => localSigningAddress = addr);
    const providerId  = () => {
        return msaInfo?.isProvider ? msaInfo?.msaId : 0
    }

</script>

<p>current action: {currentAction}</p>
<AddControlKey providerId={providerId()} {validAccounts} />
<CreateProvider />
<RequestToBeProvider />
