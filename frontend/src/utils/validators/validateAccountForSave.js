import {isHex} from "../isHex";
import {isAddress} from "../isAddress";

export const validateAccountForSave = (values) => {
    if(!values) {
        return {
            success: false,
            message: 'values undefined',
        }
    }

    const {
        privateKey,
        address,
        description,
    } = values;

    if(!description) {
        return {
            success: false,
            message: 'no description',
        }
    }

    if(!address) {
        return {
            success: false,
            message: 'no address',
        }
    }

    if(!isAddress(address)) {
        return {
            success: false,
            message: 'not a valid address',
        }
    }

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