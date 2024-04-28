import * as yup from "yup";

const botSnipeTriggerConditionsSchema = yup.object().shape({
    id: yup.number(),
    description: yup.string().required("required"),

    // MAX OUTPUT LIMIT FINDER

    // useMaxOutputLimitFinder: yup.boolean().required("required"),
    // useMaxOutputLimitFinderGasEstimation: yup.boolean().required("required"),
    // useMaxOutputLimitFinderPersistentSimulation: yup.boolean().required("required"),
    // useMaxOutputLimitFinderPending: yup.boolean().required("required"),
    maxOutputLimitFinderLowerBounds: yup.string(),
    maxOutputLimitFinderUpperBounds: yup.string(),
    maxOutputLimitFinderIncrement: yup.string(),
    useAutoBoundary: yup.boolean(),
    // maxOutputLimitFinderEthAmount: yup.string(),

    // LIQUIDITY SETTINGS
    //======================================

    //requireMinimumLiquidity: yup.boolean(),  // make always true?
    minimumLiquidity: yup.string(),
    minimumLiquidityETH: yup.string(),
    minimumLiquidityWethPools: yup.string(),  // TODO - new

    // HYPE TOKEN FILTER SETTINGS
    //======================================

    //useHypeTokenFilter: yup.boolean(),
    snipeOnlyHypeTokens: yup.boolean(),
    //hypeTokenUseTxValueFactor: yup.boolean(),
    //hypeTokenTxValueIncreaseFactor: yup.string(),
    hypeTokenMaxBlocksToTarget: yup.string(),
    hypeTokenMinimumNumberOfSwaps: yup.string(),
    hypeTokenMinimumNativeLiquidity: yup.string(),
    //hypeTokenMinimumNativeVolume: yup.string(),
    hypeTokenMinimumStablecoinLiquidity: yup.string(),
    hypeTokenMinimumWethLiquidity: yup.string(),  // TODO - new
    //hypeTokenMinimumStablecoinVolume: yup.string(),

    // HONEYPOT DETECTOR SETTINGS
    //======================================

    honeypotDetectionTaxThreshold: yup.string(),
    useBuyTaxThreshold: yup.boolean(),
    buyTaxThreshold: yup.string(),
    useSellTaxThreshold: yup.boolean(),
    sellTaxThreshold: yup.string(),
    maxBlockDelayForSells: yup.string(),  // TODO - new

    // PREDEFINED TARGET TOKENS SETTINGS
    //======================================

    //filterForPredefinedTokens: yup.boolean(),
    snipeOnlyPredefinedTokens: yup.boolean(),
    pendingPredefinedTargetTokens: yup.string(),

    // 1-CLICK PROJECTS
    //======================================

    snipeOnlyOneClickProjects: yup.boolean(),

    // GENERAL BOT SETTINGS
    //======================================

    useMaxPriceImpact: yup.boolean().required("required"),
    maxPriceImpactPercent: yup.string(),

    maxBlockAgeSeconds: yup.string(),
    getBlockLoopIntervalMs: yup.string(),

    alertOnlyMode: yup.boolean().required("required"),
});

export default botSnipeTriggerConditionsSchema;
