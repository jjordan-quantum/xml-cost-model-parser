import * as yup from "yup";

const autobotSettingsSchema = yup.object().shape({
    id: yup.number(),
    description: yup.string().required("required"),
    gasPriceSettingsId: yup.number(),
    mevSettingsId: yup.number(),
    sellTriggerConditionsId: yup.number(),
    snipeTriggerConditionsId: yup.number(),
    swapParamsId: yup.number(),

    // accounts - all addresses (lowercase)
    swarmAccountIds: yup.array().of(yup.number()),
});

export default autobotSettingsSchema;