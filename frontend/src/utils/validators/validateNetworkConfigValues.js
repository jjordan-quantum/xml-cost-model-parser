export const validateNetworkConfigValues = (values) => {
    if(!values) {
        return {
            success: false,
            message: 'values undefined',
        }
    }

    const {
        description,
        chainId,
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

    return {success: true}
}