import * as yup from "yup";

const snipeTriggerConditionsSchema = yup.object().shape({
    id: yup.number(),
    description: yup.string().required("required"),

    // TARGET BLOCK
    useTargetBlock: yup.boolean().required("required"),
    targetBlockNumber: yup.string(),

    // BLOCK TIMESTAMP
    useBlockTimestamp: yup.boolean().required("required"),
    blockTimestamp: yup.string(),

    // BLOCK SPAMMER
    useBlockSpammer: yup.boolean().required("required"),
    blockSpammerStart: yup.string(),
    blockSpammerEnd: yup.string(),
    usePreSignedTransactions: yup.boolean().required("required"),
    useSecondaryBlockStream: yup.boolean().required("required"),
    useRetriesForNonceTooHighError: yup.boolean().required("required"),

    // LIQUIDITY TRANSACTION TRIGGERS
    detectLiquidityTransaction: yup.boolean().required("required"),

    // LIQUIDITY TRANSACTION TRIGGER MODES
    useSameBlockSnipe: yup.boolean().required("required"),
    detectPendingEnableTradingTxns: yup.boolean().required("required"),
    dontMatchGweiForSameBlockSnipe: yup.boolean().required("required"),
    useSameBlockFailsafeEstimateGas: yup.boolean().required("required"),
    useSecondBlockSnipe: yup.boolean().required("required"),
    waitForBlockConfirmationsLiquidity: yup.boolean().required("required"),
    numberOfConfirmationsLiquidity: yup.string(),

    // LIQUIDITY TRANSACTION TRIGGER FILTERS
    matchSenderAddress: yup.boolean().required("required"),
    senderAddress: yup
        .string()
        .length(42, 'router hex address must be 42 characters long'),
    // matchTokenAddress: yup.boolean().required("required"),
    // tokenAddress: yup
    //     .string()
    //     .length(42, 'router hex address must be 42 characters long'),
    requireMinimumLiquidity: yup.boolean().required("required"),
    minimumLiquidity: yup.string(),
    minimumLiquidityETH: yup.string(),
    minimumLiquidityTargetToken: yup.string(),

    // SPECIFIC TARGET TRANSACTION TRIGGERS
    useTriggerTransaction: yup.boolean().required("required"),

    // SPECIFIC TARGET TRANSACTION TRIGGER FILTERS
    matchSenderAddressTarget: yup.boolean().required("required"),
    senderAddressTarget: yup
        .string()
        .length(42, 'router hex address must be 42 characters long'),
    matchContractAddress: yup.boolean().required("required"),
    contractAddress: yup
        .string()
        .length(42, 'router hex address must be 42 characters long'),
    matchInputField: yup.boolean().required("required"),
    inputField: yup.string(),

    // SPECIFIC TARGET TRANSACTION TRIGGER MODES
    useSameBlockSnipeTarget: yup.boolean().required("required"),
    dontMatchGweiForSameBlockSnipeTarget: yup.boolean().required("required"),
    // useSameBlockFailsafeTarget: yup.boolean().required("required"),
    useSameBlockFailsafeEstimateGasTarget: yup.boolean().required("required"),
    useSecondBlockSnipeTarget: yup.boolean().required("required"),
    waitForBlockConfirmationsTarget: yup.boolean().required("required"),
    numberOfConfirmationsTarget: yup.string(),

    // PERSISTENT SPAM
    usePersistentSpam: yup.boolean().required("required"),
    persistentSpamTargetSenderAddress: yup.string(),
    persistentSpamGasEstimationFailsafe: yup.boolean().required("required"),

    // ADDITIONAL TRIGGER TYPES
    estimateGas: yup.boolean().required("required"),
    // amountInForEthCall: yup.string(),
    // txValueForEthCall: yup.string(),
    waitForBlockConfirmationsEstimateGas: yup.boolean().required("required"),
    numberOfConfirmationsEstimateGas: yup.string(),

    // PERSISTENT SIMULATION
    usePersistentSimulation: yup.boolean().required("required"),
    dontMatchGweiForSameBlockSnipePersistentSimulation: yup.boolean().required("required"),

    useGetPair: yup.boolean().required("required"),
    useGetReserves: yup.boolean().required("required"),
    reservesMinimumLiquidity: yup.string(),
    reservesMinimumLiquidityETH: yup.string(),
    reservesMinimumLiquidityTargetToken: yup.string(),

    // ADDITIONAL SNIPER OPTIONS
    sendOutputTokensToSender: yup.boolean().required("required"),
    blockTriggers: yup.boolean().required("required"),
    requireAll: yup.boolean().required("required"),
    alertOnlyMode: yup.boolean().required("required"),

    // PRIVATE TXNS
    useOnlyPrivateTransactionsForSameBlockSnipes: yup.boolean().required("required"),
    useOnlyPrivateTransactions: yup.boolean().required("required"),

    // PRICE IMPACT
    useMaxPriceImpact: yup.boolean().required("required"),
    // keepCheckingPriceImpact: yup.boolean().required("required"),
    maxPriceImpactPercent: yup.string(),

    // PRICE LIMIT
    usePriceLimit: yup.boolean().required("required"),
    // keepCheckingPriceLimit: yup.boolean().required("required"),
    maxPricePerToken: yup.string(),

    // DETECT HONEYPOTS
    detectHoneypot: yup.boolean().required("required"),
    detectPendingHp: yup.boolean().required("required"),
    honeypotDetectorSimulationType: yup.string(),
    useTotalTaxThresholdForHoneypot: yup.boolean().required("required"),
    useSpecificBuyTaxThresholdForHoneypot: yup.boolean().required("required"),
    useSpecificSellTaxThresholdForHoneypot: yup.boolean().required("required"),
    honeypotDetectionTaxThreshold: yup.string(),
    honeypotDetectionBuyTaxThreshold: yup.string(),
    honeypotDetectionSellTaxThreshold: yup.string(),
    hpDetectorMaxBlockDelayForSells: yup.string(),
    // honeypotDetectionTxValue: yup.string(),
    // honeypotDetectionAmountIn: yup.string(),

    // MAX OUTPUT LIMIT FINDER
    useMaxOutputLimitFinder: yup.boolean().required("required"),
    useMaxOutputLimitFinderGasEstimation: yup.boolean().required("required"),
    useMaxOutputLimitFinderPersistentSimulation: yup.boolean().required("required"),
    useMaxOutputLimitFinderPending: yup.boolean().required("required"),
    maxOutputLimitFinderLowerBounds: yup.string(),
    maxOutputLimitFinderUpperBounds: yup.string(),
    maxOutputLimitFinderIncrement: yup.string(),
    // maxOutputLimitFinderEthAmount: yup.string(),
});

export default snipeTriggerConditionsSchema;
