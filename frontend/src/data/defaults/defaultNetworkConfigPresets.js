import * as yup from "yup";

const defaultNetworkConfigPresets = [{
    id: 0,
    description: 'DEFAULT Ethereum Mainnet Config',
    chainId: 1,

    hasWebsockets: true,
    hasBlockHeaderSubscription: true,
    hasPendingTransactionSubscription: true,
    hasLogSubscription: true,
    hasMempool: true,
    hasSequencer: false,
    hasSequencerFeed: false,
    frontRunningIsAllowed: true,
    hasEip1559Support: true,
    evmGasConsumptionFactor: 1,
    supportsDebugTrace: true,
    avgBlockTimeMs: 12000,
    notes: "",
}, {
    id: 1,
    description: 'DEFAULT Optimism Config',
    chainId: 10,
    hasWebsockets: true,
    hasBlockHeaderSubscription: true,
    hasPendingTransactionSubscription: false,
    hasLogSubscription: true,
    hasMempool: false,
    hasSequencer: true,
    hasSequencerFeed: true,
    frontRunningIsAllowed: false,
    hasEip1559Support: true,
    evmGasConsumptionFactor: 1,
    supportsDebugTrace: true, // TODO - confirm
    avgBlockTimeMs: 250,
    notes: "",
}, {
    id: 2,
    description: 'DEFAULT BNB Chain Config',
    chainId: 56,
    hasWebsockets: true,
    hasBlockHeaderSubscription: true,
    hasPendingTransactionSubscription: true,
    hasLogSubscription: true,
    hasMempool: true,
    hasSequencer: false,
    hasSequencerFeed: false,
    frontRunningIsAllowed: true,
    hasEip1559Support: false,
    evmGasConsumptionFactor: 1,
    supportsDebugTrace: true,
    avgBlockTimeMs: 3000,
    notes: "",
}, {
    id: 3,
    description: 'DEFAULT Polygon Config',
    chainId: 137,
    hasWebsockets: true,
    hasBlockHeaderSubscription: true,
    hasPendingTransactionSubscription: true,
    hasLogSubscription: true,
    hasMempool: true,
    hasSequencer: false,
    hasSequencerFeed: false,
    frontRunningIsAllowed: true,
    hasEip1559Support: true,
    evmGasConsumptionFactor: 1,
    supportsDebugTrace: true,
    avgBlockTimeMs: 2500,
    notes: "",
}, {
    id: 4,
    description: 'DEFAULT Fantom Config',
    chainId: 250,
    hasWebsockets: true,
    hasBlockHeaderSubscription: true,
    hasPendingTransactionSubscription: true,
    hasLogSubscription: true,
    hasMempool: true,
    hasSequencer: false,
    hasSequencerFeed: false,
    frontRunningIsAllowed: true,
    hasEip1559Support: false,
    evmGasConsumptionFactor: 1,
    supportsDebugTrace: true,
    avgBlockTimeMs: 1500,
    notes: "",
}, {
    id: 5,
    description: 'DEFAULT Canto Network Config',
    chainId: 7700,
    hasWebsockets: true,
    hasBlockHeaderSubscription: true,  // uses modified subscription for hosted node
    hasPendingTransactionSubscription: true, // is actually just finalized txn subscription for hosted node
    hasLogSubscription: true,
    hasMempool: true, // is actually just finalized txns
    hasSequencer: false,
    hasSequencerFeed: false,
    frontRunningIsAllowed: false, // wont work bc mempool is finalized
    hasEip1559Support: false,
    evmGasConsumptionFactor: 1,
    supportsDebugTrace: true, // TODO - confirm
    avgBlockTimeMs: 6000,
    notes: "mempool from our node is finalized txns, not pending. block headers from our node are invalid - must fetch each new block",
}, {
    id: 6,
    description: 'DEFAULT Arbitrum Config',
    chainId: 42161,
    hasWebsockets: true,
    hasBlockHeaderSubscription: true,
    hasPendingTransactionSubscription: false,
    hasLogSubscription: true,
    hasMempool: false,
    hasSequencer: true,
    hasSequencerFeed: true,
    frontRunningIsAllowed: false,
    hasEip1559Support: true,
    evmGasConsumptionFactor: 24,
    supportsDebugTrace: true, // TODO - confirm
    avgBlockTimeMs: 250,
    notes: "arb sequencer feed subscription provides faster tx confirmation than blocks",
}, {
    id: 7,
    description: 'DEFAULT Avalanche Config',
    chainId: 43114,
    hasWebsockets: true,
    hasBlockHeaderSubscription: true,
    hasPendingTransactionSubscription: false,
    hasLogSubscription: true,
    hasMempool: false,
    hasSequencer: false,
    hasSequencerFeed: false,
    frontRunningIsAllowed: false,
    hasEip1559Support: true,
    evmGasConsumptionFactor: 1,
    supportsDebugTrace: true, // TODO - confirm
    avgBlockTimeMs: 3000,
    notes: "",
}, {
    id: 8,
    description: 'DEFAULT Base Config',
    chainId: 8453,
    hasWebsockets: true,
    hasBlockHeaderSubscription: true,
    hasPendingTransactionSubscription: false,
    hasLogSubscription: true,
    hasMempool: false, // TODO - confirm
    hasSequencer: true, // TODO - confirm
    hasSequencerFeed: true, // TODO - confirm
    frontRunningIsAllowed: false, // TODO - confirm
    hasEip1559Support: true,
    evmGasConsumptionFactor: 1,
    supportsDebugTrace: true, // TODO - confirm
    avgBlockTimeMs: 2000,
    notes: "",
}, {
    id: 9,
    description: 'DEFAULT Shibarium Testnet Config',
    chainId: 719,

    hasWebsockets: true,
    hasBlockHeaderSubscription: true,
    hasPendingTransactionSubscription: true,
    hasLogSubscription: true,
    hasMempool: true,
    hasSequencer: false,
    hasSequencerFeed: false,
    frontRunningIsAllowed: true,
    hasEip1559Support: true,
    evmGasConsumptionFactor: 1,
    supportsDebugTrace: true,
    avgBlockTimeMs: 12000,
    notes: "",
}, {
    id: 10,
    description: 'DEFAULT Goerli Testnet Config',
    chainId: 5,

    hasWebsockets: true,
    hasBlockHeaderSubscription: true,
    hasPendingTransactionSubscription: true,
    hasLogSubscription: true,
    hasMempool: true,
    hasSequencer: false,
    hasSequencerFeed: false,
    frontRunningIsAllowed: true,
    hasEip1559Support: true,
    evmGasConsumptionFactor: 1,
    supportsDebugTrace: true,
    avgBlockTimeMs: 12000,
    notes: "",
}, {
    id: 11,
    description: 'DEFAULT Shib Mainnet Config',
    chainId: 109,

    hasWebsockets: true,
    hasBlockHeaderSubscription: true,
    hasPendingTransactionSubscription: true,
    hasLogSubscription: true,
    hasMempool: true,
    hasSequencer: false,
    hasSequencerFeed: false,
    frontRunningIsAllowed: true,
    hasEip1559Support: true,
    evmGasConsumptionFactor: 1,
    supportsDebugTrace: true,
    avgBlockTimeMs: 5000,
    notes: "",
}, {
    id: 12,
    description: 'DEFAULT JJ Private Network Config',
    chainId: 17,

    hasWebsockets: true,
    hasBlockHeaderSubscription: true,
    hasPendingTransactionSubscription: true,
    hasLogSubscription: true,
    hasMempool: true,
    hasSequencer: false,
    hasSequencerFeed: false,
    frontRunningIsAllowed: true,
    hasEip1559Support: true,
    evmGasConsumptionFactor: 1,
    supportsDebugTrace: true,
    avgBlockTimeMs: 10000,
    notes: "",
}];

export default defaultNetworkConfigPresets;

export const defaultNetworkConfigDescriptions = defaultNetworkConfigPresets.map(o => o.description);

export const ensureDefaults = (networkConfigs, setNetworkConfigs) => {
    const descriptions = (networkConfigs || []).map(o => o.description);
    const ids = (networkConfigs || []).map(o => o.id);
    let maxId = -1;
    let rendered = false;

    for(const id of ids) {
        if(typeof(id) !== 'undefined') {
            if(id > maxId) { maxId = id; }
        }
    }

    for(const item of defaultNetworkConfigPresets) {
        const {description} = item;

        if(!descriptions.includes(description)) {
            rendered = true;
            maxId++;
            const useId = maxId;

            networkConfigs.push({
                ...item,
                id: useId,
            });
        }
    }

    if(rendered) {
        setNetworkConfigs(networkConfigs);
    }
}
