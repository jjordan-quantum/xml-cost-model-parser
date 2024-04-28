import * as yup from "yup";

const secondTriggerWalletSettingsSchema = yup.object().shape({
    id: yup.number(),
    description: yup.string().required("required"),

    useSecondaryTriggerWallet: yup.boolean(),
    secondaryTriggerWallet: yup.string(),
    txValueForSecondaryTriggerWallet: yup.string(),
    useSlippageForSecondaryTriggerWallet: yup.boolean(),
    slippagePercentForSecondaryTriggerWallet: yup.string(),


    usePrivateTxnsForSecondaryTriggerWalletSameBlock: yup.boolean(),
    usePrivateTxnsForSecondaryTriggerWallet: yup.boolean(),
    doNotMatchGweiSecondaryTriggerWallet: yup.boolean(),
});

export default secondTriggerWalletSettingsSchema;
