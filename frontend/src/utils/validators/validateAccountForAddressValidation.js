import {isHex} from "../isHex";

export const validateAccountForAddressValidation = (values) => {
    if(!values) {
        return {
            success: false,
            message: 'values undefined',
        }
    }

    const {
        privateKey,
    } = values;

    if(!privateKey) {
        return {
            success: false,
            message: 'private key undefined',
        }
    }

    if(privateKey.length !== 64) {
        return {
            success: false,
            message: 'private key is the wrong length',
        }
    }

    if(!isHex(privateKey)) {
        return {
            success: false,
            message: 'private key is not hex',
        }
    }

    return {success: true}
}
