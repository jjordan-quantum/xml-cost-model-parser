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

const Topbar = () => {
    const componentName = 'Topbar';
    const log = (message) => console.log(`[${componentName}] ${message}`);

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);

    const [getAccounts, setAccounts] = useStorage('accounts', defaultAccounts);

    const [getEnvironment, setEnvironment] = useStorage('environment', {});
    const [getEnvironmentEdit, setEnvironmentEdit] = useStorage('environmentEdit', {});

    const [getConnections, setConnections] = useStorage('connections', []);
    const [getConnectionEdits, setConnectionEdits] = useStorage('connectionEdits', []);
    const [getNewConnectionEdit, setNewConnectionEdit] = useStorage('newConnectionEdit', undefined);

    const [getNetworkConfigs, setNetworkConfigs] = useStorage('networkConfigs', defaultNetworkConfigPresets);

    const [getExecutors, setExecutors] = useStorage('executors', []);
    const [getExecutorEdits, setExecutorEdits] = useStorage('executorEdits', []);
    const [getNewExecutorEdit, setNewExecutorEdit] = useStorage('newExecutorEdit', undefined);

    const [getSnipeSessionSettings, setSnipeSessionSettings] = useStorage('snipeSessionSettings', []);
    const [getSnipeSessionEdits, setSnipeSessionEdits] = useStorage('snipeSessionEdits', []);
    const [getNewSnipeSessionEdit, setNewSnipeSessionEdit] = useStorage('newSnipeSessionEdit', undefined);

    const [getGasPriceSettings, setGasPriceSettings] = useStorage('gasPriceSettings', []);
    const [getMevSettings, setMevSettings] = useStorage('mevSettings', []);
    const [getSellTriggerConditions, setSellTriggerConditions] = useStorage('sellTriggerConditions', []);
    const [getSnipeTriggerConditions, setSnipeTriggerConditions] = useStorage('snipeTriggerConditions', []);
    const [getSwapParams, setSwapParams] = useStorage('swapParams', []);
    const [getSecondTriggerWalletSettings, setSecondTriggerWalletSettings] = useStorage('secondTriggerWalletSettings', []);

    const [waiting, setWaiting] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [modalText, setModalText] = useState('SAMPLE MODAL TEXT');

    const getNetworkConfigForId = (id) => {
        return (getNetworkConfigs() || []).filter(o => (o.id === id))[0];
    }

    const getValuesForId = (_id) => {
        const connections = getConnections();

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
        const values = getEnvironment();

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

                        setEnvironment(values);
                        handleActivateEnvironment();
                    }
                }
            });
        }
    }

    const handleViewStorage = () => {
        // TODO - generate storage string

        const accounts = getAccounts();

        const environment = getEnvironment();
        const environmentEdit = getEnvironmentEdit();

        const connections = getConnections();
        const connectionEdits = getConnectionEdits();
        const newConnectionEdit = getNewConnectionEdit();

        const networkConfigs = getNetworkConfigs();

        const executors = getExecutors();
        const executorEdits = getExecutorEdits();
        const newExecutorEdit = getNewExecutorEdit();

        const snipeSessionSettings = getSnipeSessionSettings();
        const snipeSessionEdits = getSnipeSessionEdits();
        const newSnipeSessionEdit = getNewSnipeSessionEdit();

        const gasPriceSettings = getGasPriceSettings();
        const mevSettings = getMevSettings();
        const sellTriggerConditions = getSellTriggerConditions();
        const snipeTriggerConditions = getSnipeTriggerConditions();
        const swapParams = getSwapParams();
        const secondTriggerWalletSettings = getSecondTriggerWalletSettings();

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

        const gasPriceSettingsStorage = !!gasPriceSettings ? stringify(gasPriceSettings) : '';
        const mevSettingsStorage = !!mevSettings ? stringify(mevSettings) : '';
        const sellTriggerConditionsStorage = !!sellTriggerConditions ? stringify(sellTriggerConditions) : '';
        const snipeTriggerConditionsStorage = !!snipeTriggerConditions ? stringify(snipeTriggerConditions) : '';
        const swapParamsStorage = !!swapParams ? stringify(swapParams) : '';
        const secondTriggerWalletSettingsStorage = !!secondTriggerWalletSettings ? stringify(secondTriggerWalletSettings) : '';

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

            + `\n\nGAS PRICE SETTINGS\n\n` + gasPriceSettingsStorage
            + `\n\nMEV SETTINGS\n\n` + mevSettingsStorage
            + `\n\nSELL TRIGGER CONDITIONS\n\n` + sellTriggerConditionsStorage
            + `\n\nSNIPE TRIGGER CONDITIONS\n\n` + snipeTriggerConditionsStorage
            + `\n\nSWAP PARAMS\n\n` + swapParamsStorage
            + `\n\nSECOND TRIGGER WALLET SETTINGS\n\n` + secondTriggerWalletSettingsStorage

        // window.alert(
        //     message
        // );

        setModalText(message)
        setShowModal(true);
    }

    const handleClearStorage = () => {
        if(window.confirm(`ARE YOU SURE YOU WANT TO CLEAR BROWSER STORAGE FOR THE SNIPER APP?\n\nTHIS WILL DELETE ALL PRESETS AND OTHER SAVED INFO.`)) {
            setAccounts(defaultAccounts);

            setEnvironment(undefined);
            setEnvironmentEdit(undefined);

            setConnections([]);
            setConnectionEdits([]);
            setNewConnectionEdit(undefined);

            setNetworkConfigs(defaultNetworkConfigPresets);

            setExecutors([]);
            setExecutorEdits([]);
            setNewExecutorEdit(undefined);

            setSnipeSessionSettings([]);
            setSnipeSessionEdits([]);
            setNewSnipeSessionEdit(undefined);

            setGasPriceSettings([]);
            setMevSettings([]);
            setSellTriggerConditions([]);
            setSnipeTriggerConditions([]);
            setSwapParams([]);
            setSecondTriggerWalletSettings([]);

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
