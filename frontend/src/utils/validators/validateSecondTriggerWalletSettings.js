import {isHex} from "../isHex";

export const validateSecondTriggerWalletSettings = (values) => {
    if(!values) {
        return {
            success: false,
            message: 'values undefined',
        }
    }

    const {
        description,
        useSecondaryTriggerWallet,
        secondaryTriggerWallet,
    } = values;

    if(!description) {
        return {
            success: false,
            message: 'no description',
        }
    }

    if(useSecondaryTriggerWallet) {
        if(!secondaryTriggerWallet) {
            return {
                success: false,
                message: 'private key undefined for second trigger wallet',
            }
        }

        if(secondaryTriggerWallet.length !== 64) {
            return {
                success: false,
                message: 'private key is the wrong length for second trigger wallet',
            }
        }

        if(!isHex(secondaryTriggerWallet)) {
            return {
                success: false,
                message: 'private key is not hex for second trigger wallet',
            }
        }
    }

    return {success: true}
}