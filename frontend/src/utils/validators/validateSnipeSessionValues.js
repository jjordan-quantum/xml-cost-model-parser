import {isAddress} from "../isAddress";

export const validateSnipeSessionValues = (values, botMode=false) => {
    if(!values) {
        return {
            success: false,
            message: 'values undefined',
        }
    }

    const {
        description,
        //chainId,

        tokenContractAddress,
        tokenContractName,
        gasPriceSettingsId,
        mevSettingsId,
        sellTriggerConditionsId,
        snipeTriggerConditionsId,
        swapParamsId,
        secondTriggerWalletSettingsId,

        swarmAccountIds,
    } = values;

    if(!description) {
        return {
            success: false,
            message: 'no description',
        }
    }

    // if(!chainId) {
    //     return {
    //         success: false,
    //         message: 'no chain ID',
    //     }
    // }

    if(!botMode && !tokenContractAddress) {
        return {
            success: false,
            message: 'no token contract provided',
        }
    }

    if(!botMode && !isAddress(tokenContractAddress)) {
        return {
            success: false,
            message: `token contract ${tokenContractAddress} is not a valid address`,
        }
    }

    if(!botMode && !tokenContractName) {
        return {
            success: false,
            message: 'no token name provided',
        }
    }

    if(typeof(gasPriceSettingsId) === 'undefined') {
        return {
            success: false,
            message: 'gas price settings undefined',
        }
    }

    if(typeof(mevSettingsId) === 'undefined') {
        return {
            success: false,
            message: 'MEV settings undefined',
        }
    }

    if(typeof(sellTriggerConditionsId) === 'undefined') {
        return {
            success: false,
            message: 'sell trigger conditions undefined',
        }
    }

    if(typeof(snipeTriggerConditionsId) === 'undefined') {
        return {
            success: false,
            message: 'snipe trigger conditions undefined',
        }
    }

    if(typeof(swapParamsId) === 'undefined') {
        return {
            success: false,
            message: 'swap params undefined',
        }
    }

    if(!botMode && typeof(secondTriggerWalletSettingsId) === 'undefined') {
        return {
            success: false,
            message: 'second trigger wallet settings undefined',
        }
    }

    if(!swarmAccountIds) {
        return {
            success: false,
            message: 'swarm accounts undefined',
        }
    } else if(swarmAccountIds.length === 0) {
        return {
            success: false,
            message: 'no swarm accounts provided',
        }
    }

    return {success: true}
}