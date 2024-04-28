const defaultConnections = [{
    id: 0,
    description: 'DEFAULT Mainnet Node Connection',
    chainId: 1,

    wssProvider: 'wss://18.205.56.36/ws/',
    httpsProvider: 'https://18.205.56.36/rpc/',

    alwaysSendPrivateTxn: false,
    doNotStreamBlocks: false,
    doNotStreamMempoolGasPrices: false,
    useNextBlockNumberForEthCall: false,
    networkConfigId: 0,
    hasNetworkConfig: true,
}, {
    id: 1,
    description: 'DEFAULT Arbitrum Node Connection',
    chainId: 42161,

    wssProvider: 'wss://44.210.96.104/ws/',
    httpsProvider: 'https://44.210.96.104/rpc/',

    alwaysSendPrivateTxn: false,
    doNotStreamBlocks: true,
    doNotStreamMempoolGasPrices: false,
    useNextBlockNumberForEthCall: false,
    networkConfigId: 6,
    hasNetworkConfig: true,
}];

export default defaultConnections;

export const defaultConnectionDescriptions = defaultConnections.map(o => o.description);

export const ensureDefaultConnections = (connections, setConnections) => {
    const descriptions = (connections || []).map(o => o.description);
    const ids = (connections || []).map(o => o.id);
    let maxId = -1;
    let rendered = false;

    for(const id of ids) {
        if(typeof(id) !== 'undefined') {
            if(id > maxId) { maxId = id; }
        }
    }

    for(const item of defaultConnections) {
        const {description} = item;

        if(!descriptions.includes(description)) {
            rendered = true;
            maxId++;
            const useId = maxId;

            connections.push({
                ...item,
                id: useId,
            });
        }
    }

    if(rendered) {
        setConnections(connections);
    }
}