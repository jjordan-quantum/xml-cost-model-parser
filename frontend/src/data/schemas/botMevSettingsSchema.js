import * as yup from "yup";

const botMevSettingsSchema = yup.object().shape({
    id: yup.number(),
    description: yup.string().required("required"),

    mevContractId: yup.number().required("required"),

    mevContractAddress: yup
        .string()
        .length(42, 'MEV contract address must be 42 characters long'),

    mevDeployerPrivateKey: yup
        .string()
        .length(64, 'MEV contract address must be 42 characters long'),

    // same block snipe
    useMevWithSameBlockSnipe: yup.boolean().required("required"),
    useOnlyMevForSameBlockSnipe: yup.boolean().required("required"),
    useSlippageForSameBlockMev: yup.boolean().required("required"),
    slippagePercentForMevSameBlockSnipe: yup.string(),
    useDifferentTxValueForMevSameBlockSnipe: yup.boolean().required("required"),
    txValueForMevSameBlockSnipe: yup.string(),
    mevSameBlockSnipeEthAmountForCoinbaseTransfer: yup.string(),
    mevSameBlockSnipeNumberOfBlocksToTarget: yup.string(),

    // ADDITIONAL BUNDLE
    sendAdditionalMevBundleSameBlockSnipe: yup.boolean().required("required"),
    useMevAccount2ForAdditionalBundle: yup.boolean().required("required"),
    sendOnlyAdditionalBundleSameBlockSnipe: yup.boolean().required("required"),
    useDifferentTxValueForAdditionalBundle: yup.boolean().required("required"),
    txValueForAdditionalBundle: yup.string(),
    ethAmountForCoinbaseTransferForAdditionalBundle: yup.string(),
    numberOfBlocksForAdditionalBundle: yup.string(),

    // second block snipe
    useMevWithSecondBlockSnipe: yup.boolean().required("required"),
    useOnlyMevForSecondBlockSnipe: yup.boolean().required("required"),
    useSlippageForSecondBlockMev: yup.boolean().required("required"),
    slippagePercentForMevSecondBlockSnipe: yup.string(),
    useMevAccount2ForSecondBlockSnipe: yup.boolean().required("required"),
    useDifferentTxValueForMev: yup.boolean().required("required"),
    txValueForMev: yup.string(),
    mevEthAmountForCoinbaseTransfer: yup.string(),
    mevNumberOfBlocksToTarget: yup.string(),

    mevAccountPrivateKey: yup
        .string()
        .length(64, 'MEV contract address must be 42 characters long'),

    mevAccount2PrivateKey: yup
        .string()
        .length(64, 'MEV contract address must be 42 characters long'),
});

export default botMevSettingsSchema;
