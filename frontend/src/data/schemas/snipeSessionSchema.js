import * as yup from "yup";

const snipeSessionSchema = yup.object().shape({
    id: yup.number(),
    description: yup.string().required("required"),
    tokenContractAddress: yup.string().required("required"),
    tokenContractName: yup.string(),  // auto-populated?
    gasPriceSettingsId: yup.number(),
    mevSettingsId: yup.number(),
    sellTriggerConditionsId: yup.number(),
    snipeTriggerConditionsId: yup.number(),
    swapParamsId: yup.number(),
    secondTriggerWalletSettingsId: yup.number(),

    // accounts - all addresses (lowercase)
    swarmAccountIds: yup.array().of(yup.number()),
    mevAcctId: yup.number(),
    mevAcct2Id: yup.number(),
    wallet2Id: yup.number(),
});

export default snipeSessionSchema;
