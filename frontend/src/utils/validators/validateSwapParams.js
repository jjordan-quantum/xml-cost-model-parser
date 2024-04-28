export const validateSwapParams = (values) => {
    if(!values) {
        return {
            success: false,
            message: 'values undefined',
        }
    }

    const {
        router,
        swapPath,
        useMultiRouter,
        useMultiPath,
        routers,
        stableCoins,
        minEthLiquidityForMultiRouter,
        minUsdLiquidityForMultiRouter,
    } = values;

    if(!useMultiRouter && !router) {
        return {
            success: false,
            message: 'Router Address must be provided if not using Multi-Router',
        }
    }

    if(useMultiRouter && !routers) {
        return {
            success: false,
            message: 'Please provide Router Addresses for Multi-Router separated by spaces',
        }
    }

    if(!useMultiPath && !swapPath) {
        return {
            success: false,
            message: 'Swap Path must be provided if not using Multi-Path',
        }
    }

    if(useMultiPath && !stableCoins) {
        return {
            success: false,
            message: 'Must provide Stablecoin Addresses to for Multi-Path',
        }
    }

    if(useMultiRouter || useMultiPath) {
        if(!minEthLiquidityForMultiRouter) {
            return {
                success: false,
                message: 'Minimum ETH liquidity required if using Multi-Router or Multi-Path'
            }
        }

        if(!minUsdLiquidityForMultiRouter) {
            return {
                success: false,
                message: 'Minimum USD liquidity required if using Multi-Router or Multi-Path'
            }
        }
    }

    return { success: true, }
}
