import * as yup from "yup";

const connectionsSchema = yup.object().shape({
    id: yup.number(),
    description: yup.string().required("required"),
    chainId: yup.number().required("required"),
    wssProvider: yup.string(),
    httpsProvider: yup.string(),
    httpsProviderDebugTrace: yup.string(),
    httpsProviderFlashbots: yup.string(),

    alwaysSendPrivateTxn: yup.boolean().required("required"),
    doNotStreamBlocks: yup.boolean().required("required"), // TODO - move to dashboard
    doNotStreamMempoolGasPrices: yup.boolean().required("required"), // TODO - move to dashboard
    useNextBlockNumberForEthCall: yup.boolean(), // TODO - move to dashboard

    networkConfigId: yup.number().required("required"),
    hasNetworkConfig: yup.boolean().required('required'),
});

export default connectionsSchema;
