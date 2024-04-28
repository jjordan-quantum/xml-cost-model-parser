export const SNIPER_PORT_NUMBER = process.env.REACT_APP_SNIPER_PORT_NUMBER;
export const SNIPER_SERVER_URL = `http://localhost:${SNIPER_PORT_NUMBER}`;

export const chainIdOptions = [
    { value: 1, label: '1 - Ethereum Mainnet' },
    { value: 5, label: '5 - Goerli Testnet' },
    { value: 10, label: '10 - Optimism' },
    { value: 17, label: '17 - JJ Private Network' },
    { value: 56, label: '56 - BNB Chain' },
    { value: 109, label: '109 - Shib Mainnet' },
    { value: 137, label: '137 - Polygon' },
    { value: 250, label: '250 - Fantom' },
    { value: 719, label: '719 - Shibarium Testnet' },
    { value: 7700, label: '7700 - Canto Network' },
    { value: 8453, label: '8453 - Base Mainnet' },
    { value: 42161, label: '42161 - Arbitrum' },
    { value: 43114, label: '43114 - Avalanche' },
];

export const MAINNET_UNISWAPV2_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
export const MAINNET_SUSHISWAP_ROUTER = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F';
export const MAINNET_UNISWAPV3_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
export const ARBITRUM_SUSHISWAP_ROUTER = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';
export const ARBITRUM_CAMELOT_ROUTER = '0xc873fEcbd354f5A56E00E710B90EF4201db2448d';
export const POLYGON_QUICKSWAPV2_ROUTER = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff';
export const POLYGON_QUICKSWAPV3_ROUTER = '0xf5b509bB0909a69B1c207E495f687a596C168E12';
export const POLYGON_SUSHISWAP_ROUTER = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';
export const OPTIMISM_SUSHISWAP_ROUTER = 'unknown';
export const CANTO_DEX_BASE_V1_ROUTER_ADDRESS = '0xa252eEE9BDe830Ca4793F054B506587027825a8e';
export const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
export const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
export const ARB_WETH = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1';
export const ARB_USDC = '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8';
export const POLY_WETH = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';
export const POLY_USDC = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
export const OPT_WETH = '0x4200000000000000000000000000000000000006';  // CONFIRM
export const OPT_USDC = '0x7F5c764cBc14f9669B88837ca1490cCa17c31607';
export const CANTO_WCANTO = '0x826551890Dc65655a0Aceca109aB11AbDbD7a07B';
export const CANTO_USDC = '0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd';
export const MAINNET_USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
export const MAINNET_DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';