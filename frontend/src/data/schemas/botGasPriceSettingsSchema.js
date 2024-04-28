import * as yup from "yup";

const botGasPriceSettingsSchema = yup.object().shape({
    id: yup.number(),
    description: yup.string().required("required"),
    txType: yup.string().required("required"),  // TODO - use select box?
    gasPrice: yup.string(),
    txMaxFeePerGas: yup.string(),
    txMaxPriorityFeePerGas: yup.string(),
    frontRun: yup.boolean().required("required"),
    maxGasPriceForFrontRunning: yup.string(),
    onlyFrontRunSimilar: yup.boolean().required("required"),
});

export default botGasPriceSettingsSchema;
