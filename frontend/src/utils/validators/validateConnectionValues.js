export const validateConnectionValues = (values) => {
    if(!values) {
        return {
            success: false,
            message: 'values undefined',
        }
    }

    const {
        description,
        chainId,
        wssProvider,
        httpsProvider,
        httpsProviderDebugTrace,
        httpsProviderFlashbots,
        networkConfigId,
    } = values;

    if(!description) {
        return {
            success: false,
            message: 'no description',
        }
    }

    if(!chainId) {
        return {
            success: false,
            message: 'Chain ID address',
        }
    }

    if(!wssProvider && !httpsProvider) {
        return {
            success: false,
            message: 'Must provide at least one of Websocket Provider and HTTPS Provider',
        }
    }

    if(
        wssProvider
        && !(
            wssProvider.toLowerCase().startsWith('ws://')
            || wssProvider.toLowerCase().startsWith('wss://')
        )
    ) {
        return {
            success: false,
            message: 'wrong format for websocket connection - must start with ws:// or wss://',
        }
    }

    if(
        httpsProvider
        && !(
            httpsProvider.toLowerCase().startsWith('http://')
            || httpsProvider.toLowerCase().startsWith('https://')
        )
    ) {
        return {
            success: false,
            message: 'wrong format for HTTP connection - must start with http:// or https://',
        }
    }

    if(
        httpsProviderDebugTrace
        && !(
            httpsProviderDebugTrace.toLowerCase().startsWith('http://')
            || httpsProviderDebugTrace.toLowerCase().startsWith('https://')
        )
    ) {
        return {
            success: false,
            message: 'wrong format for Debug-Trace HTTP connection - must start with http:// or https://',
        }
    }

    if(
        httpsProviderFlashbots
        && !(
            httpsProviderFlashbots.toLowerCase().startsWith('http://')
            || httpsProviderFlashbots.toLowerCase().startsWith('https://')
        )
    ) {
        return {
            success: false,
            message: 'wrong format for MEV Bundle HTTP connection - must start with http:// or https://',
        }
    }


    if(typeof(networkConfigId) === 'undefined') {
        return {
            success: false,
            message: 'network config id undefined',
        }
    }

    return {success: true}
}