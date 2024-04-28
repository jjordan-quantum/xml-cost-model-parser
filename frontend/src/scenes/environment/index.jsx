import {
    Box,
    Button,
    FormControl,
    FormControlLabel,
    FormLabel, Radio, RadioGroup,
    Switch,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import {useLocation, useNavigate} from "react-router-dom";
import useSessionStorage from "../../utils/useSessionStorage";
import gasPriceSettingsSchema from "../../data/schemas/gasPriceSettingsSchema";
import {tokens} from "../../theme";
import React, {useState} from "react";
import Select, { Option, ReactSelectProps } from 'react-select'
import environmentSchema from "../../data/schemas/environmentSchema";
import {sendCommand} from "../../utils/sendCommand";
import {getStatus} from "../../utils/getStatus";
import {chainIdOptions, SNIPER_SERVER_URL} from "../../utils/constants";
import ProgressWheel from "../../components/ProgressWheel";
import defaultNetworkConfigPresets, {ensureDefaults} from "../../data/defaults/defaultNetworkConfigPresets";
import {stringify} from "../../utils/utils";
import {ensureDefaultConnections} from "../../data/defaults/defaultConnections";

const initialValues = {
    id: undefined,

    snipeMode: "manual",
    chainId: 1,
    connectionId: undefined,
};

const Environment = () => {
    const componentName = 'Environment';
    const log = (message) => console.log(`[${componentName}] ${message}`);

    // =================================================================================================================
    //
    //  set up theme
    //
    // =================================================================================================================

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // =================================================================================================================
    //
    //  set up / initialize state
    //
    // =================================================================================================================

    const { state } = useLocation();

    const {
        //loadId,
        loadMode,
        useValues,  // values to load with (top priority)
        useEdit, // boolean -> should use edit for initial values, otherwise, check for environment in state
        useConnectionId, // connection Id value to use (came back from editing connection)
    } = (!!state ? state : {});

    log(`Loading environment with state ${JSON.stringify(!!state ? state : {})}`);

    const isNonMobile = useMediaQuery("(min-width:600px");
    const navigate = useNavigate();
    const [connections, setConnections] = useSessionStorage('connections', []);
    const [environment, setEnvironment] = useSessionStorage('environment', initialValues);
    const [environmentEdit, setEnvironmentEdit] = useSessionStorage('environmentEdit', initialValues);
    const [waiting, setWaiting] = useState(false);
    const [networkConfigs, setNetworkConfigs] = useSessionStorage('networkConfigs', defaultNetworkConfigPresets);
    ensureDefaults(networkConfigs, setNetworkConfigs);
    ensureDefaultConnections(connections, setConnections);

    const getInitialValues = () => {
        try {
            if(useValues) {
                log(`Using values from routed state`);
                return {...useValues};
            }

            if(useEdit && environmentEdit) {
                log(`Using env edit, as specified in routed state`);

                return {
                    ...environmentEdit,
                    connectionId: (typeof(useConnectionId) !== 'undefined') ? useConnectionId : environmentEdit.connectionId,
                }
            }

            if(environment) {
                return {
                    ...environment,
                    connectionId: (typeof(useConnectionId) !== 'undefined') ? useConnectionId : environmentEdit.connectionId,
                }
            }

            // TODO - check if sniper app is running -> get env state -> load
            log(`Using initial values`);

            return {
                ...initialValues,
                connectionId: (typeof(useConnectionId) !== 'undefined') ? useConnectionId : initialValues.connectionId,
            }
        } catch(e) {
            log(`Error getting initial values`);
            console.log(e);
            return initialValues;
        }
    }

    // =================================================================================================================
    //
    //  connections options management
    //
    // =================================================================================================================

    let currentChainId = environment && environment.chainId ? environment.chainId : 1;

    const getConnectionOptionsForChainId = (_chainId) => {
        try {
            return connections
                .filter((connection) => {
                    return (connection && connection.chainId && connection.chainId === _chainId);
                })
                .map((connection) => {
                    return {
                        value: connection.id,
                        label: `${connection.id} - ${connection.description}`,
                    }
                });
        } catch(e) {
            log(`Error getting connection options for chainId`);
            console.log(e);
            return [];
        }
    }

    const initialConnectionOptions = getConnectionOptionsForChainId(currentChainId);
    const [connectionOptions, setConnectionOptions] = useState(initialConnectionOptions);

    const updateConnectionOptions = () => {
        setConnectionOptions(getConnectionOptionsForChainId(currentChainId));
    }

    const updateChainId = (_chainId) => {
        currentChainId = _chainId;
        updateConnectionOptions();
    }

    const getNetworkConfigForId = (id) => {
        try {
            return networkConfigs.filter(o => (
                o
                && typeof(o.id) !== 'undefined'
                && (o.id === id)
            ))[0];
        } catch(e) {
            log(`Error getting network config for id`);
            console.log(e);
            return undefined;
        }
    }

    const getValuesForId = (_id) => {
        try {
            const connection = connections.filter(o => (
                o
                && typeof(o.id) !== 'undefined'
                && (o.id === _id)
            ))[0];

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
        } catch(e) {
            log(`Error getting values for id`);
            console.log(e);
            return undefined;
        }
    }

    // =================================================================================================================
    //
    //  connections actions handlers
    //
    // =================================================================================================================

    const handleEditConnections = (id, values) => {
        if(typeof(id) === 'undefined') {
            log('id undefined - nothing to edit');
            return;
        }

        log(`Saving environment edit: ${JSON.stringify(values)}`);
        setEnvironmentEdit(values);
        log(`Editing connections: ${id}`);

        navigate(
            '/connections',
            { state: { loadId: id, loadMode: 'edit', origin: 'environment' } }
        );
    }

    const handleDuplicateConnections = (id, values) => {
        if(typeof(id) === 'undefined') {
            log('id undefined - nothing to duplicate');
            return;
        }

        log(`Saving environment edit: ${JSON.stringify(values)}`);
        setEnvironmentEdit(values);
        log(`Duplicating connections: ${id}`);

        navigate(
            '/connections',
            { state: { loadId: id, loadMode: 'duplicate', origin: 'environment' } }
        );
    }

    const handleCreateConnections = (values) => {
        log(`Saving environment edit: ${JSON.stringify(values)}`);
        setEnvironmentEdit(values);
        log(`Creating new connections`);

        navigate(
            '/connections',
            { state: { loadMode: 'new', origin: 'environment' } }
        );
    }

    // =================================================================================================================
    //
    //  environment controls handlers
    //
    // =================================================================================================================

    const handleFormSubmit = (values) => {}

    const handleSaveEnvironmentSettings = (values) => {
        log(`Save Environment button clicked with values ${JSON.stringify(values)}`);

        try {
            // if(values.snipeMode !== 'manual') {
            //     window.alert(`Cannot save environment - only manual snipe mode currently supported`);
            //     return;
            // }

            const saveConnections = getValuesForId(values.connectionId);

            if(values.chainId !== saveConnections.chainId) {
                window.alert(`Cannot save environment - chainId in selected connection settings does not match chainId chosen for environment`);
                return;
            }

            setWaiting(true);

            // send save environment request to sniper app (requires that it is not currently active)
            sendCommand(SNIPER_SERVER_URL, 'updateEnvironmentSettings', 'async', {
                ...values,
                ...getValuesForId(values.connectionId),
                hasNetworkConfig: true,
            }, (err, data) => {
                setWaiting(false);

                try {
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
                            setEnvironmentEdit(values);
                        }
                    }
                } catch(e) {
                    log(`Error processing response to request for updating environment settings`);
                    console.log(e);
                    window.alert(`Error processing response to request for updating environment settings: ${e.toString()}`);
                }
            });
        } catch(e) {
            log(`Error saving environment settings`);
            console.log(e);
            window.alert(`Error saving environment settings: ${e.toString()}`);
        }
    }

    const handleResetEnvironmentSettings = (setFieldValue) => {
        log(`Reset Environment button clicked`);
        setWaiting(true);

        getStatus(SNIPER_SERVER_URL, 'getEnvironmentSettings', {}, (err, data) => {
            setWaiting(false);

            try {
                if(err) {
                    // TODO - take no action
                } else if(!data) {
                    log(`Data undefined in response to request for getting env settings`);
                    window.alert(`Data undefined in response to request for getting env settings`);
                } else {
                    log(`Resetting environment settings to ${JSON.stringify(data)}`);

                    setEnvironment({...data});
                    setEnvironmentEdit({...data});

                    setFieldValue('snipeMode', data.snipeMode, false);
                    setFieldValue('chainId', data.chainId, false);
                    updateChainId(data.chainId);
                    setFieldValue('connectionId', data.connectionId, false);
                }
            } catch(e) {
                log(`Error processing response to get environment settings`);
                console.log(e);
                window.alert(`Error processing response to get environment settings: ${e.toString()}`);
            }
        });
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

    const handlePauseEnvironment = () => {
        log(`Pause Environment button clicked`);
        setWaiting(true);

        // send activate request to sniper app
        sendCommand(SNIPER_SERVER_URL, 'pauseEnvironment', 'sync', {}, (err, data) => {
            setWaiting(false);

            if(err) {
                // TODO - take no action
            } else if(!data) {
                log(`Data undefined in response to request for pausing environment`);
                window.alert(`Data undefined in response to request for pausing environment`);
            } else {
                const { success, message, error } = data;

                if(!success) {
                    const _message = `Sniper app failed to pause environment: ${message}`;
                    log(_message);
                    window.alert(_message);
                } else {
                    window.alert(message ? `Snipe environment paused: ${message}` : 'Snipe environment paused');
                }
            }
        });
    }

    const handleKillEnvironment = () => {
        log(`Kill Environment button clicked`);
        setWaiting(true);

        // send activate request to sniper app
        sendCommand(SNIPER_SERVER_URL, 'killEnvironment', 'sync', {}, (err, data) => {
            setWaiting(false);

            if(err) {
                // TODO - take no action
            } else if(!data) {
                log(`Data undefined in response to request for killing environment`);
                window.alert(`Data undefined in response to request for killing environment`);
            } else {
                const { success, message, error } = data;

                if(!success) {
                    const _message = `Sniper app failed to kill environment: ${message}`;
                    log(_message);
                    window.alert(_message);
                } else {
                    window.alert(message ? `Snipe environment killed: ${message}` : 'Snipe environment killed');
                    //setEnvironment(undefined);
                }
            }
        });
    }

    // =================================================================================================================
    //
    //  options for select boxes
    //
    // =================================================================================================================

    const snipeModeOptions = [
        { value: 'manual', label: 'Manual Snipe Mode' },
        { value: 'bot', label: 'Auto-Bot Mode' },
    ];

    // update selections when chainId changes
    const connectionIdOptions = connections
        .filter((connection) => {
            return (connection && connection.chainId && connection.chainId === currentChainId);
        })
        .map((connection) => {
            return {
                value: connection.id,
                label: `${connection.id} - ${connection.description}`,
            }
        });

    const customStyles = {
        option: (defaultStyles, state) => ({
            ...defaultStyles,
            color: "#fff",
            backgroundColor: colors.primary[400] ,
        }),

        control: (defaultStyles) => ({
            ...defaultStyles,
            backgroundColor: "#293040",
            padding: "10px",
            border: "none",
            boxShadow: "none",
        }),
        singleValue: (defaultStyles) => ({ ...defaultStyles, color: "#fff" }),
        container: provided => ({
            ...provided,
            width: "auto"
            //width: "max-content",
            //minWidth: "100%"
        })
    };

    // =================================================================================================================
    //
    //  component
    //
    // =================================================================================================================

    return(
        <Box m="20px" mt="75px" minHeight="85vh">
            <Header title="ENVIRONMENT" subtitle="Configure and control the active snipe environment" />

            <Formik
                onSubmit={handleFormSubmit}
                initialValues={getInitialValues()}
                validationSchema={environmentSchema}
            >
                {({ values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue }) => (
                    <form onSubmit={handleSubmit}>
                        <Box
                            display="grid"
                            gap="30px"
                            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                            sx={{
                                "& > div": { gridColumn: isNonMobile ? undefined : "span 4"}
                            }}
                        >
                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Snipe Mode
                            </Typography>

                            {/*TODO - add select options for [manual, bot]*/}
                            <FormControl sx={{
                                gridColumn: "span 4"
                            }}>
                                <Select
                                    options={snipeModeOptions}
                                    name="snipeMode"
                                    value={(snipeModeOptions ? snipeModeOptions.find(option => option.value === values.snipeMode) : '')}
                                    onChange={(option) => {
                                        setFieldValue( 'snipeMode', option.value, false);
                                        setEnvironmentEdit(values);
                                    }}
                                    onBlur={handleBlur}
                                    styles={customStyles}
                                />
                            </FormControl>

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Chain ID
                            </Typography>

                            <FormControl sx={{
                                gridColumn: "span 4"
                            }}>
                                <Select
                                    options={chainIdOptions}
                                    name="chainId"
                                    value={(chainIdOptions ? chainIdOptions.find(option => option.value === values.chainId) : '')}
                                    onChange={(option) => {
                                        setFieldValue( 'chainId', option.value, false  );
                                        updateChainId(option.value);
                                        setEnvironmentEdit(values);
                                    }}
                                    onBlur={handleBlur}
                                    styles={customStyles}
                                />
                            </FormControl>

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Connection
                            </Typography>

                            <FormControl sx={{
                                gridColumn: "span 3"
                            }}>
                                <Select
                                    options={connectionOptions}
                                    name="connectionId"
                                    value={(connectionOptions ? connectionOptions.find(option => option.value === values.connectionId) : '')}
                                    onChange={(option) => {
                                        setFieldValue( 'connectionId', option.value, false  );
                                        setEnvironmentEdit(values);
                                    }}
                                    onBlur={handleBlur}
                                    styles={customStyles}
                                />
                            </FormControl>

                            <Box
                                display="flex"
                                justifyContent="end"
                                p="10px"
                                sx={{
                                    gridColumn: "span 1"
                                }}
                            >
                                <Box ml="1px" mr="1px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleEditConnections(values.connectionId, values) }}>
                                        EDIT
                                    </Button>
                                </Box>

                                <Box ml="1px" mr="1px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleDuplicateConnections(values.connectionId, values) }}>
                                        COPY
                                    </Button>
                                </Box>

                                <Box ml="1px" mr="1px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleCreateConnections(values) }}>
                                        NEW
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Environment Controls
                            </Typography>

                            <Box
                                display="flex"
                                justifyContent="left"
                                p="10px"
                                sx={{
                                    gridColumn: "span 1"
                                }}
                            >
                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleSaveEnvironmentSettings(values) }}>
                                        SAVE
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h4"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 3" }}
                            >
                                Save the above settings to the sniper app environment and validate the connections. The environment must be stopped for this.
                            </Typography>

                            <Box
                                display="flex"
                                justifyContent="left"
                                p="10px"
                                sx={{
                                    gridColumn: "span 1"
                                }}
                            >
                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleResetEnvironmentSettings(setFieldValue) }}>
                                        RESET
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h4"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 3" }}
                            >
                                Resets the above fields to the settings from the current environment in the sniper app.
                            </Typography>

                            <Box
                                display="flex"
                                justifyContent="left"
                                p="10px"
                                sx={{
                                    gridColumn: "span 1"
                                }}
                            >
                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleActivateEnvironment() }}>
                                        ACTIVATE
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h4"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 3" }}
                            >
                                Once environment is activated, snipe sessions can be created / started, and connections cannot be modified.
                            </Typography>

                            <Box
                                display="flex"
                                justifyContent="left"
                                p="10px"
                                sx={{
                                    gridColumn: "span 1"
                                }}
                            >
                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handlePauseEnvironment() }}>
                                        PAUSE
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h4"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 3" }}
                            >
                                All triggers and execution will be paused, and no new snipe sessions will start. Connections cannot be modified. Press ACTIVATE to unpause.
                            </Typography>

                            <Box
                                display="flex"
                                justifyContent="left"
                                p="10px"
                                sx={{
                                    gridColumn: "span 1"
                                }}
                            >
                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleKillEnvironment() }}>
                                        KILL
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h4"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 3" }}
                            >
                                Deactivates the snipe environment, aborting all snipe sessions and discarding states. Connections can now be updated.
                            </Typography>
                        </Box>
                    </form>
                )}
            </Formik>

            {waiting && (<ProgressWheel />)}
        </Box>
    );
};

export default Environment;
