import * as yup from "yup";

const swapParamsSchema = yup.object().shape({
    id: yup.number(),
    description: yup.string().required("required"),
    router: yup
        .string()
        .length(42, 'router hex address must be 42 characters long'), // only required if not using multi-router
    routerSelect: yup.string().required("required"),
    useMevExecutor: yup.boolean().required("required"),
    onlyBuyOnce: yup.boolean(),
    useSpecificInput: yup.boolean().required("required"),
    specificInput: yup.string(),
    functionSelect: yup.string().required("required"),  // TODO - use select box?
    swapType: yup.string(),  // TODO - only for balancer?
    txValue: yup.string().required("required"),
    txGas: yup.number().required("required"),
    amountIn: yup.string(),
    amountOut: yup.string(),
    sqrtPriceX96: yup.string(),
    fee: yup.string(), // for fee path array string
    swapPath: yup.string(), // only required if not using multi-path
    poolIdPath: yup.string(), // for poolId path array string - only balancer
    recipient: yup.string(), // only if tokens are to go to a specific sender
    deadline: yup.string(),
    useSlippage: yup.boolean().required("required"),
    slippagePercent: yup.number(),

    // multi-router
    useMultiRouter: yup.boolean().required("required"),
    useMultiPath: yup.boolean().required("required"),
    routers: yup.string(),
    stableCoins: yup.string(),
    minEthLiquidityForMultiRouter: yup.string(),
    minUsdLiquidityForMultiRouter: yup.string(),

    // added by snipesession
    targetTokenAddress: yup.string(),
});

export default swapParamsSchema;
