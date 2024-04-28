export const validateGasPriceSettings = (values) => {
    if(!values) {
        return {
            success: false,
            message: 'values undefined',
        }
    }

    const {
        description,
        txType,
        gasPrice,
        txMaxFeePerGas,
        frontRun,
        maxGasPriceForFrontRunning,
    } = values;

    if(!description) {
        return {
            success: false,
            message: 'no description',
        }
    }

    if(!txType) {
        return {
            success: false,
            message: 'no tx type selected',
        }
    }

    if(txType === '0') {
        if(!gasPrice) {
            return {
                success: false,
                message: 'no gas price provided for legacy tx type',
            }
        }

        const _gasPrice = parseFloat(gasPrice);

        if(!_gasPrice) {
            return {
                success: false,
                message: 'invalid gas price provided for legacy tx type',
            }
        }
    } else if(txType === '2') {
        if(!txMaxFeePerGas) {
            return {
                success: false,
                message: 'no max fee per gas provided for eip-1559 tx type',
            }
        }

        const _txMaxFeePerGas = parseFloat(txMaxFeePerGas);

        if(!_txMaxFeePerGas) {
            return {
                success: false,
                message: 'invalid  max fee per gas provided for eip-1559 tx type',
            }
        }
    }

    if(frontRun) {
        if(!maxGasPriceForFrontRunning) {
            return {
                success: false,
                message: 'no max gas price provided for frontrunning',
            }
        }

        const _maxGasPriceForFrontRunning = parseFloat(maxGasPriceForFrontRunning);

        if(!_maxGasPriceForFrontRunning) {
            return {
                success: false,
                message: 'invalid max gas price provided for frontrunning',
            }
        }
    }

    return {success: true}
}