import * as yup from "yup";

const networkConfigSchema = yup.object().shape({
    id: yup.number(),
    description: yup.string().required("required"),

    chainId: yup.number().required('required'),
    hasWebsockets: yup.boolean().required('required'),
    hasBlockHeaderSubscription: yup.boolean().required('required'),
    hasPendingTransactionSubscription: yup.boolean().required('required'),
    hasLogSubscription: yup.boolean().required('required'),
    hasMempool: yup.boolean().required('required'),
    hasSequencer: yup.boolean().required('required'),
    hasSequencerFeed: yup.boolean().required('required'),
    frontRunningIsAllowed: yup.boolean().required('required'),
    hasEip1559Support: yup.boolean().required('required'),
    evmGasConsumptionFactor: yup.number().required('required'),
    supportsDebugTrace: yup.boolean().required('required'),
    avgBlockTimeMs: yup.number().required('required'),
    notes: yup.string(),
});

export default networkConfigSchema;
