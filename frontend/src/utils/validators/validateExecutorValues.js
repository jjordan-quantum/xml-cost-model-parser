import {isAddress} from "../isAddress";

export const validateExecutorValues = (values) => {
    if(!values) {
        return {
            success: false,
            message: 'values undefined',
        }
    }

    const {
        description,
        chainId,
        deployerAddress,
        executorContractAddress,
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
            message: 'no chain ID',
        }
    }

    if(!deployerAddress) {
        return {
            success: false,
            message: 'Deployer address field blank',
        }
    }

    if(!executorContractAddress) {
        return {
            success: false,
            message: 'Executor address field blank',
        }
    }

    if(!isAddress(deployerAddress)) {
        return {
            success: false,
            message: 'Deployer is not a valid address',
        }
    }

    if(!isAddress(executorContractAddress)) {
        return {
            success: false,
            message: 'Executor address is not a valid address',
        }
    }

    return {success: true}
}