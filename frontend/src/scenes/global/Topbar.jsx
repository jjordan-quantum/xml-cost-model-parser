import {Box, Button, IconButton, useTheme} from "@mui/material";
import React, {useContext, useState} from "react";
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import useSessionStorage from "../../utils/useSessionStorage";
import defaultNetworkConfigPresets from "../../data/defaults/defaultNetworkConfigPresets";
import {sendCommand} from "../../utils/sendCommand";
import {SNIPER_SERVER_URL} from "../../utils/constants";
import {stringify} from "../../utils/utils";
import ProgressWheel from "../../components/ProgressWheel";
import defaultAccounts from "../../data/defaults/defaultAccounts";
import Modal, {ModalBody, ModalFooter, ModalHeader} from "../../components/Modal";
import {useStorage} from "../../utils/useStorage";
import getStorage from "../../utils/getStorage";
import setStorage from "../../utils/setStorage";
import defaultSwapParamsPresets from "../../data/defaults/defaultSwapParamsPresets";

const Topbar = () => {
    const componentName = 'Topbar';
    const log = (message) => console.log(`[${componentName}] ${message}`);

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);

    const [waiting, setWaiting] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [modalText, setModalText] = useState('SAMPLE MODAL TEXT');

    const getNetworkConfigForId = (id) => {
        const networkConfigs = getStorage('networkConfigs');
        return (networkConfigs || []).filter(o => (o.id === id))[0];
    }

    const getValuesForId = (_id) => {
        const connections = getStorage('connections');

        console.log(connections);

        if(!connections) {
            log('connections undefined');
            return undefined;
        }

        const connection = connections.filter(o => (o.id === _id))[0];
        if(!connection) { return undefined; }
        const networkConfig = getNetworkConfigForId(connection.networkConfigId);

        if(networkConfig) {
            for(const key of Object.keys(networkConfig)) {
                if(['chainId', 'id'].includes(key)) { continue; }

                if(key === 'description') {
                    connection.networkConfigDescription = networkConfig.description;
                    continue;
                }

                connection[key] = networkConfig[key];
            }
        }


        return connection;
    }

    const handleActivateEnvironment = () => {
        log(`Activate Environment button clicked`);
        setWaiting(true);

        // send activate request to sniper app
        sendCommand(SNIPER_SERVER_URL, 'activateEnvironment', 'sync', {}, (err, data) => {
            setWaiting(false);

            if(err) {
                // TODO - take no action
            } else if(!data) {
                log(`Data undefined in response to request for activating environment`);
                window.alert(`Data undefined in response to request for activating environment`);
            } else {
                const { success, message, error } = data;

                if(!success) {
                    const _message = `Sniper app failed to activate environment: ${message}`;
                    log(_message);
                    window.alert(_message);
                } else {
                    window.alert(message ? `Snipe environment activated: ${message}` : 'Snipe environment activated');
                }
            }
        });
    }

    const handleQuickConnect = () => {
        const values = getStorage('environment');

        if(!values) {
            log(`Environment settings undefined - cannot quick connect`);
            window.alert(`Environment settings undefined - cannot quick connect`);
        }

        const connectionSettings = getValuesForId(values.connectionId);

        if(!connectionSettings) {
            log(`Connection settings undefined - cannot quick connect`);
            window.alert(`Connection settings undefined - cannot quick connect`);
        }

        if(window.confirm(`
            Saving / Activating Environment with the last saved settings:
            
            Snipe Mode: ${values.snipeMode}
            Chain ID: ${values.chainId}
            
            Connection ID: ${values.connectionId}
            Description: ${connectionSettings.description}
            
            Network Config: ${connectionSettings.networkConfigDescription}
            
            HTTPS Provider: ${connectionSettings.httpsProvider}
            WebSocket Provider: ${connectionSettings.wssProvider}
            MEV HTTPS Provider: ${connectionSettings.httpsProviderFlashbots}
            
            Always Send Private Txns: ${connectionSettings.alwaysSendPrivateTxn}
            Do Not Stream Blocks: ${connectionSettings.doNotStreamBlocks}
            Do Not Stream Mempool Gas Prices: ${connectionSettings.doNotStreamMempoolGasPrices}
        `)) {
            setWaiting(true);

            // send save environment request to sniper app (requires that it is not currently active)
            sendCommand(SNIPER_SERVER_URL, 'updateEnvironmentSettings', 'async', {
                ...values,
                ...connectionSettings,
                hasNetworkConfig: true,
            }, (err, data) => {
                setWaiting(false);

                if(err) {
                    // TODO - take no action
                } else if(!data) {
                    log(`Data undefined in response to request for updating env settings`);
                    window.alert(`Data undefined in response to request for updating env settings`);
                } else {
                    const { success, message, error } = data;

                    if(!success) {
                        const _message = `Sniper app failed to update environment settings: ${message}`;
                        log(_message);
                        window.alert(_message);
                    } else {
                        const connectionSettings = getValuesForId(values.connectionId);
                        log(`Sniper environment updated with the following:\n${stringify(connectionSettings)}`);

                        window.alert(
                            `Sniper environment updated with the following:
                        
                        Snipe Mode: ${values.snipeMode}
                        Chain ID: ${values.chainId}
                        
                        Connection ID: ${values.connectionId}
                        Description: ${connectionSettings.description}
                        
                        Network Config: ${connectionSettings.networkConfigDescription}
                        
                        HTTPS Provider: ${connectionSettings.httpsProvider}
                        WebSocket Provider: ${connectionSettings.wssProvider}
                        MEV HTTPS Provider: ${connectionSettings.httpsProviderFlashbots}
                        
                        Always Send Private Txns: ${connectionSettings.alwaysSendPrivateTxn}
                        Do Not Stream Blocks: ${connectionSettings.doNotStreamBlocks}
                        Do Not Stream Mempool Gas Prices: ${connectionSettings.doNotStreamMempoolGasPrices}
                        `
                        );

                        //setEnvironment(values);  // TODO
                        handleActivateEnvironment();
                    }
                }
            });
        }
    }

    const handleViewStorage = () => {
        // TODO - generate storage string

        const accounts = getStorage('accounts');

        const environment = getStorage('environment');
        const environmentEdit = getStorage('environmentEdit');

        const connections = getStorage('connections');
        const connectionEdits = getStorage('connectionEdits');
        const newConnectionEdit = getStorage('newConnectionEdit');

        const networkConfigs = getStorage('networkConfigs');

        const executors = getStorage('executors');
        const executorEdits = getStorage('executorEdits');
        const newExecutorEdit = getStorage('newExecutorEdit');

        const snipeSessionSettings = getStorage('snipeSessionSettings');
        const snipeSessionEdits = getStorage('snipeSessionEdits');
        const newSnipeSessionEdit = getStorage('newSnipeSessionEdit');

        const autobotSettings = getStorage('autobotSettings');
        const autobotSettingsEdits = getStorage('autobotSettingsEdits');
        const newAutobotSettingsEdit = getStorage('newAutobotSettingsEdit');

        const gasPriceSettings = getStorage('gasPriceSettings');
        const mevSettings = getStorage('mevSettings');
        const sellTriggerConditions = getStorage('sellTriggerConditions');
        const snipeTriggerConditions = getStorage('snipeTriggerConditions');
        const swapParams = getStorage('swapParams');
        const secondTriggerWalletSettings = getStorage('secondTriggerWalletSettings');

        const botGasPriceSettings = getStorage('botGasPriceSettings');
        const botMevSettings = getStorage('botMevSettings');
        const botSellTriggerConditions = getStorage('botSellTriggerConditions');
        const botSnipeTriggerConditions = getStorage('botSnipeTriggerConditions');
        const botSwapParams = getStorage('botSwapParams');

        /////////////////////////////////////////////////////////

        const accountsStorage = !!accounts ? stringify(accounts) : '';

        const environmentStorage = !!environment ? stringify(environment) : '';
        const environmentEditStorage = !!environmentEdit ? stringify(environmentEdit) : '';

        const connectionsStorage = !!connections ? stringify(connections) : '';
        const connectionEditsStorage = !!connectionEdits ? stringify(connectionEdits) : '';
        const newConnectionEditStorage = !!newConnectionEdit ? stringify(newConnectionEdit) : '';

        const networkConfigsStorage = !!networkConfigs ? stringify(networkConfigs) : '';

        const executorsStorage = !!executors ? stringify(executors) : '';
        const executorEditsStorage = !!executorEdits ? stringify(executorEdits) : '';
        const newExecutorEditStorage = !!newExecutorEdit ? stringify(newExecutorEdit) : '';

        const snipeSessionSettingsStorage = !!snipeSessionSettings ? stringify(snipeSessionSettings) : '';
        const snipeSessionEditsStorage = !!snipeSessionEdits ? stringify(snipeSessionEdits) : '';
        const newSnipeSessionEditStorage = !!newSnipeSessionEdit ? stringify(newSnipeSessionEdit) : '';

        const autobotSettingsStorage = !!autobotSettings ? stringify(autobotSettings) : '';
        const autobotSettingsEditsStorage = !!autobotSettingsEdits ? stringify(autobotSettingsEdits) : '';
        const newAutobotSettingsEditStorage = !!newAutobotSettingsEdit ? stringify(newAutobotSettingsEdit) : '';

        const gasPriceSettingsStorage = !!gasPriceSettings ? stringify(gasPriceSettings) : '';
        const mevSettingsStorage = !!mevSettings ? stringify(mevSettings) : '';
        const sellTriggerConditionsStorage = !!sellTriggerConditions ? stringify(sellTriggerConditions) : '';
        const snipeTriggerConditionsStorage = !!snipeTriggerConditions ? stringify(snipeTriggerConditions) : '';
        const swapParamsStorage = !!swapParams ? stringify(swapParams) : '';
        const secondTriggerWalletSettingsStorage = !!secondTriggerWalletSettings ? stringify(secondTriggerWalletSettings) : '';

        const botGasPriceSettingsStorage = !!botGasPriceSettings ? stringify(botGasPriceSettings) : '';
        const botMevSettingsStorage = !!botMevSettings ? stringify(botMevSettings) : '';
        const botSellTriggerConditionsStorage = !!botSellTriggerConditions ? stringify(botSellTriggerConditions) : '';
        const botSnipeTriggerConditionsStorage = !!botSnipeTriggerConditions ? stringify(botSnipeTriggerConditions) : '';
        const botSwapParamsStorage = !!botSwapParams ? stringify(botSwapParams) : '';

        const message = `ACCOUNTS\n\n` + accountsStorage

            + `\n\nENVIRONMENT\n\n` + environmentStorage
            + `\n\nENVIRONMENT EDIT\n\n` + environmentEditStorage

            + `\n\nCONNECTIONS\n\n` + connectionsStorage
            + `\n\nCONNECTIONS EDITS\n\n` + connectionEditsStorage
            + `\n\nNEW CONNECTION EDIT\n\n` + newConnectionEditStorage

            + `\n\nNETWORK CONFIG\n\n` + networkConfigsStorage

            + `\n\nEXECUTORS\n\n` + executorsStorage
            + `\n\nEXECUTORS EDITS\n\n` + executorEditsStorage
            + `\n\nNEW EXECUTOR EDIT\n\n` + newExecutorEditStorage

            + `\n\nSNIPE SESSION SETTINGS\n\n` + snipeSessionSettingsStorage
            + `\n\nSNIPE SESSION EDITS\n\n` + snipeSessionEditsStorage
            + `\n\nNEW SNIPE SESSION EDIT\n\n` + newSnipeSessionEditStorage

            + `\n\nAUTOBOT SETTINGS\n\n` + autobotSettingsStorage
            + `\n\nAUTOBOT SETTINGS EDITS\n\n` + autobotSettingsEditsStorage
            + `\n\nNEW AUTOBOT SETTINGS EDIT\n\n` + newAutobotSettingsEditStorage

            + `\n\nGAS PRICE SETTINGS\n\n` + gasPriceSettingsStorage
            + `\n\nMEV SETTINGS\n\n` + mevSettingsStorage
            + `\n\nSELL TRIGGER CONDITIONS\n\n` + sellTriggerConditionsStorage
            + `\n\nSNIPE TRIGGER CONDITIONS\n\n` + snipeTriggerConditionsStorage
            + `\n\nSWAP PARAMS\n\n` + swapParamsStorage
            + `\n\nSECOND TRIGGER WALLET SETTINGS\n\n` + secondTriggerWalletSettingsStorage

            + `\n\nBOT GAS PRICE SETTINGS\n\n` + botGasPriceSettingsStorage
            + `\n\nBOT MEV SETTINGS\n\n` + botMevSettingsStorage
            + `\n\nBOT SELL TRIGGER CONDITIONS\n\n` + botSellTriggerConditionsStorage
            + `\n\nBOT SNIPE TRIGGER CONDITIONS\n\n` + botSnipeTriggerConditionsStorage
            + `\n\nBOT SWAP PARAMS\n\n` + botSwapParamsStorage

        // window.alert(
        //     message
        // );

        setModalText(message)
        setShowModal(true);
    }

    const handleClearStorage = () => {
        if(window.confirm(`ARE YOU SURE YOU WANT TO CLEAR BROWSER STORAGE FOR THE SNIPER APP?\n\nTHIS WILL DELETE ALL PRESETS AND OTHER SAVED INFO.`)) {
            setStorage('accounts', defaultAccounts);

            setStorage('environment', undefined);
            setStorage('environmentEdit', undefined);

            setStorage('connections', []);
            setStorage('connectionEdits', []);
            setStorage('newConnectionEdit', undefined);

            setStorage('networkConfigs', defaultNetworkConfigPresets);

            setStorage('executors', []);
            setStorage('executorEdits', []);
            setStorage('newExecutorEdit', undefined);

            setStorage('snipeSessionSettings', []);
            setStorage('snipeSessionEdits', []);
            setStorage('newSnipeSessionEdit', undefined);

            setStorage('autobotSettings', []);
            setStorage('autobotSettingsEdits', []);
            setStorage('newAutobotSettingsEdit', undefined);

            setStorage('gasPriceSettings', []);
            setStorage('mevSettings', []);
            setStorage('sellTriggerConditions', []);
            setStorage('snipeTriggerConditions', []);
            setStorage('swapParams', defaultSwapParamsPresets);
            setStorage('secondTriggerWalletSettings', []);

            setStorage('botGasPriceSettings', []);
            setStorage('botMevSettings', []);
            setStorage('botSellTriggerConditions', []);
            setStorage('botSnipeTriggerConditions', []);
            setStorage('botSwapParams', []);

            window.alert(`Storage reset back to defaults`);
        }
    }

    return (
        <Box display="flex" justifyContent="space-between" p={2}>
            {/* SEARCH BAR */}
            <Box
                display="flex"
                backgroundColor={colors.primary[400]}
                borderRadius="3px"
            >
                <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
                <IconButton type="button" sx={{ p: 1 }}>
                    <SearchIcon />
                </IconButton>
                <Button color="secondary" variant="contained" sx={{ ml: 1 }} onClick={() => {handleViewStorage();}}>
                    VIEW STORAGE
                </Button>
                <Button color="warning" variant="contained" sx={{ ml: 1 }} onClick={() => {handleClearStorage();}}>
                    CLEAR STORAGE
                </Button>
            </Box>

            {/* ICONS */}
            <Box display="flex">
                <Button color="secondary" variant="contained" onClick={() => {handleQuickConnect();}}>
                    QUICK CONNECT
                </Button>
                <IconButton onClick={colorMode.toggleColorMode}>
                    {theme.palette.mode === "dark" ? (
                        <DarkModeOutlinedIcon />
                    ) : (
                        <LightModeOutlinedIcon />
                    )}
                </IconButton>
                <IconButton>
                    <NotificationsOutlinedIcon />
                </IconButton>
                <IconButton>
                    <SettingsOutlinedIcon />
                </IconButton>
                <IconButton>
                    <PersonOutlinedIcon />
                </IconButton>
            </Box>

            {waiting && (<ProgressWheel />)}
            <Modal
                show={showModal}
                setShow={setShowModal}
                // hideCloseButton
            >
                <ModalHeader>
                    <h2 style={{ color: 'black' }}>Storage</h2>
                </ModalHeader>
                <ModalBody>
                    <p style={{ textAlign: 'justify', color: 'black' }}>
                        {/*Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt maxime dolorem asperiores laboriosam ad delectus ea. Tempora tempore repellendus laudantium fugiat saepe mollitia eius illo possimus laborum consequuntur, tenetur neque.*/}
                        {modalText}
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        </Box>
    );
};

export default Topbar;
