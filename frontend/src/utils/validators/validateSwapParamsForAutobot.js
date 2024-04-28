export const validateSwapParamsForAutobot = (values) => {
    if(!values) {
        return {
            success: false,
            message: 'values undefined',
        }
    }

    const {
        routers,
        snipeAllRouters,
        stableCoins,
    } = values;


    if(!routers && !snipeAllRouters) {
        return {
            success: false,
            message: 'Please provide Router Addresses in swap params or select "snipe all routers"',
        }
    }

    if(!stableCoins) {
        return {
            success: false,
            message: 'Must provide Stablecoin Addresses',
        }
    }

    return { success: true, }
}
