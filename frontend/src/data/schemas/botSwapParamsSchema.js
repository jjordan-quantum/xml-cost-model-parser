import * as yup from "yup";

const botSwapParamsSchema = yup.object().shape({
    id: yup.number(),
    description: yup.string().required("required"),

    routers: yup.string(),
    snipeAllRouters: yup.boolean(),

    useMevExecutor: yup.boolean().required("required"),
    onlyBuyOnce: yup.boolean(),

    stableCoins: yup.string(),

    functionSelect: yup.string().required("required"),  // TODO - use select box?

    useSlippage: yup.boolean().required("required"),
    slippagePercent: yup.number(),

    //recipient: yup.string(), // only if tokens are to go to a specific sender
    deadline: yup.string(),
    txValue: yup.string().required("required"),
    txGas: yup.number().required("required"),

    snipeWrappedEthPools: yup.boolean().required('required'),
    wrappedEthContractAddress: yup.string(),
    wethAmountIn: yup.string(),  // TODO - new
});

export default botSwapParamsSchema;
