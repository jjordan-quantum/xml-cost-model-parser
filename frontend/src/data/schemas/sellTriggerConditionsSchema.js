import * as yup from "yup";

const sellTriggerConditionsSchema = yup.object().shape({
    id: yup.number(),
    description: yup.string().required("required"),

    autoApproveRouter: yup.boolean().required("required"),

    // REMOVE LIQUIDITY

    frontunRemoveLiquidityTxn: yup.boolean().required("required"),
    tracePendingTxnsForRemoveLiquidityTxn: yup.boolean().required("required"),
    minimumLiquidityPercentForSell: yup.string(),

    // HP ACTIVATION

    frontrunHpActivationTxn: yup.boolean().required("required"),
    hpActivationSellTaxThreshold: yup.string(),
    useBlockDelayForSimulatingSells: yup.boolean().required("required"),
    hpActivationBlockDelay: yup.string(),

    // GENERAL

    usePrivateTxnsForSell: yup.boolean().required("required"),
    useSlippageForSell: yup.boolean().required("required"),
    slippageForSell: yup.string(),

    // SELL AT TARGET PRICE GAIN

    sellTargetTokensAtPriceGain: yup.boolean().required("required"),
    targetPriceGain: yup.string(),
    percentOfTokensToSell: yup.string(),
    gasPriceForSellingTokens: yup.string(),
    usePrivateTxnsForSellAtTargetPriceGain: yup.boolean().required("required"),
    useMevForSellAtTargetPriceGain: yup.boolean().required("required"),
});

export default sellTriggerConditionsSchema;
