import {
    MAINNET_DAI,
    MAINNET_SUSHISWAP_ROUTER,
    MAINNET_UNISWAPV2_ROUTER,
    MAINNET_UNISWAPV3_ROUTER, MAINNET_USDT,
    USDC, WETH
} from "../../utils/constants";

const defaultSwapParamsPresets = [{
    // mainnet_multi_router_multipath
    id: 0,
    description: "DEFAULT - Mainnet - Multirouter - Multipath",
    router: "",
    routerSelect: undefined,
    useMevExecutor: false,
    onlyBuyOnce: false,
    useSpecificInput: false,
    specificInput: "",
    functionSelect: "11",
    swapType: "",
    txValue: "1.0",
    txGas: "750000",
    amountIn: "",
    amountOut: "1",
    sqrtPriceX96: "",
    fee: "",
    swapPath: '',
    poolIdPath: "",
    recipient: "",
    useSlippage: false,
    slippagePercent: "",

    // multi-router
    useMultiRouter: true,
    useMultiPath: true,
    routers: `${MAINNET_UNISWAPV2_ROUTER} ${MAINNET_UNISWAPV3_ROUTER} ${MAINNET_SUSHISWAP_ROUTER}`,
    stableCoins: `${USDC} ${MAINNET_USDT} ${MAINNET_DAI}`,
    minEthLiquidityForMultiRouter: '1.0',
    minUsdLiquidityForMultiRouter: '2000.0',

    targetTokenAddress: '',
}, {
    // mainnet_uniswapv2_weth
    id: 1,
    description: "DEFAULT - Mainnet - UniswapV2 - WETH",
    router: MAINNET_UNISWAPV2_ROUTER,
    routerSelect: "UniswapV2",
    useMevExecutor: false,
    onlyBuyOnce: false,
    useSpecificInput: false,
    specificInput: "",
    functionSelect: "11",
    swapType: "",
    txValue: "1.0",
    txGas: "750000",
    amountIn: "",
    amountOut: "1",
    sqrtPriceX96: "",
    fee: "",
    swapPath: WETH,
    poolIdPath: "",
    recipient: "",
    useSlippage: false,
    slippagePercent: "",

    // multi-router
    useMultiRouter: false,
    useMultiPath: false,
    routers: '',
    stableCoins: '',
    minEthLiquidityForMultiRouter: '',
    minUsdLiquidityForMultiRouter: '',

    targetTokenAddress: '',
}, {
    // mainnet_uniswapv2_weth_usdc
    id: 2,
    description: "DEFAULT - Mainnet - UniswapV2 - WETH-USDC",
    router: MAINNET_UNISWAPV2_ROUTER,
    routerSelect: "UniswapV2",
    useMevExecutor: false,
    onlyBuyOnce: false,
    useSpecificInput: false,
    specificInput: "",
    functionSelect: "11",
    swapType: "",
    txValue: "1.0",
    txGas: "750000",
    amountIn: "",
    amountOut: "1",
    sqrtPriceX96: "",
    fee: "",
    swapPath: `${WETH} ${USDC}`,
    poolIdPath: "",
    recipient: "",
    useSlippage: false,
    slippagePercent: "",

    // multi-router
    useMultiRouter: false,
    useMultiPath: false,
    routers: '',
    stableCoins: '',
    minEthLiquidityForMultiRouter: '',
    minUsdLiquidityForMultiRouter: '',

    targetTokenAddress: '',
}];

export default defaultSwapParamsPresets;

export const defaultSwapParamsDescriptions = defaultSwapParamsPresets.map(s => s.description);

export const ensureDefaultSwapParams = (swapParams, setSwapParams) => {
    const descriptions = (swapParams || []).map(o => o.description);
    const ids = (swapParams || []).map(o => o.id);
    let maxId = -1;
    let rendered = false;

    for(const id of ids) {
        if(typeof(id) !== 'undefined') {
            if(id > maxId) { maxId = id; }
        }
    }

    for(const item of defaultSwapParamsPresets) {
        const {description} = item;

        if(!descriptions.includes(description)) {
            rendered = true;
            maxId++;
            const useId = maxId;

            swapParams.push({
                ...item,
                id: useId,
            });
        }
    }

    if(rendered) {
        setSwapParams(swapParams);
    }
}
