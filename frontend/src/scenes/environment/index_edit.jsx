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
const SNIPER_PORT_NUMBER = process.env.REACT_APP_SNIPER_PORT_NUMBER;
const SNIPER_SERVER_URL = `http://localhost:${SNIPER_PORT_NUMBER}`;

const initialValues = {
    id: undefined,

    snipeMode: "manual",
    chainId: 1,
    connectionId: undefined,
};

const EnvironmentEdit = () => {
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

    const getInitialValues = () => {
        console.log('Getting initial values');
        return initialValues;
    }

    const loadInitialValues = (setFieldValue) => {
        log('Getting initial values');
        let useSettingsFromSniper = true;

        if(useValues) {
            log(`Using values from routed state`);
            setEnvironmentEdit({...useValues});
            useSettingsFromSniper = false;

            for(const key of Object.keys(useValues)) {
                setFieldValue(key, useValues[key], false);
            }
        }

        if(useEdit && environmentEdit) {
            log(`Using env edit, as specified in routed state`);
            useSettingsFromSniper = false;

            setEnvironmentEdit({
                ...environmentEdit,
                connectionId: (typeof(useConnectionId) !== 'undefined') ? useConnectionId : environmentEdit.connectionId,
            });

            for(const key of Object.keys(environmentEdit)) {
                if(key === 'connectionId') {
                    setFieldValue(
                        key,
                        (typeof(useConnectionId) !== 'undefined') ? useConnectionId : environmentEdit.connectionId,
                        false
                    );
                } else {
                    setFieldValue(key, environmentEdit[key], false);
                }
            }
        }

        // check if sniper app is running -> get env state -> load
        getStatus(SNIPER_SERVER_URL, 'getEnvironmentSettings', {}, (err, data) => {
            if(err) {
                // TODO - do not set environment
                if(useSettingsFromSniper) {
                    for(const key of Object.keys(initialValues)) {
                        setFieldValue(key, initialValues[key], false);
                    }
                }
            } else if(!data) {
                log(`Data undefined in response to request for getting env settings`);
                window.alert(`Data undefined in response to request for getting env settings`);

                if(useSettingsFromSniper) {
                    for(const key of Object.keys(initialValues)) {
                        setFieldValue(key, initialValues[key], false);
                    }
                }
            } else {
                log(`Resetting environment settings to ${JSON.stringify(data)}`);

                setEnvironment({...data});

                if(useSettingsFromSniper) {
                    setEnvironmentEdit({...data});

                    for(const key of Object.keys(data)) {
                        setFieldValue(key, data[key], false);
                    }
                }
            }
        });
    }

    // =================================================================================================================
    //
    //  connections options management
    //
    // =================================================================================================================

    let currentChainId = environment && environment.chainId ? environment.chainId : 1;

    const getConnectionOptionsForChainId = (_chainId) => {
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

    const getValuesForId = (_id) => {
        return connections.filter(o => (o.id === _id))[0];
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

        log(`Editing connections: ${id}`);
        setEnvironmentEdit(values);

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

        log(`Duplicating connections: ${id}`);
        setEnvironmentEdit(values);

        navigate(
            '/connections',
            { state: { loadId: id, loadMode: 'duplicate', origin: 'environment' } }
        );
    }

    const handleCreateConnections = (values) => {
        log(`Creating new connections`);
        setEnvironmentEdit(values);

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

        if(values.snipeMode !== 'manual') {
            window.alert(`Cannot save environment - only manual snipe mode currently supported`);
            return;
        }

        const saveConnections = getValuesForId(values.connectionId);

        if(values.chainId !== saveConnections.chainId) {
            window.alert(`Cannot save environment - chainId in selected connection settings does not match chainId chosen for environment`);
            return;
        }

        // send save environment request to sniper app (requires that it is not currently active)
        sendCommand(SNIPER_SERVER_URL, 'updateEnvironmentSettings', 'async', {
            ...values,
            ...getValuesForId(values.connectionId),
        }, (err, data) => {
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

                    window.alert(
                        `Sniper environment updated with the following:
                        
                        Snipe Mode: ${values.snipeMode}
                        Chain ID: ${values.chainId}
                        
                        Connection ID: ${values.connectionId}
                        Description: ${connectionSettings.description}
                        
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
        });
    }

    const handleResetEnvironmentSettings = (setFieldValue) => {
        log(`Reset Environment button clicked`);

        getStatus(SNIPER_SERVER_URL, 'getEnvironmentSettings', {}, (err, data) => {
            if(err) {
                // TODO - take no action
            } else if(!data) {
                log(`Data undefined in response to request for getting env settings`);
                window.alert(`Data undefined in response to request for getting env settings`);
            } else {
                log(`Resetting environment settings to ${JSON.stringify(data)}`);

                setEnvironment({...data});
                setEnvironmentEdit({...data});

                for(const key of Object.keys(data)) {
                    setFieldValue(key, data[key], false);
                }
            }
        });
    }

    const handleActivateEnvironment = () => {
        log(`Activate Environment button clicked`);

        // send activate request to sniper app
        sendCommand(SNIPER_SERVER_URL, 'activateEnvironment', 'sync', {}, (err, data) => {
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

        // send activate request to sniper app
        sendCommand(SNIPER_SERVER_URL, 'pauseEnvironment', 'sync', {}, (err, data) => {
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

        // send activate request to sniper app
        sendCommand(SNIPER_SERVER_URL, 'killEnvironment', 'sync', {}, (err, data) => {
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

    const chainIdOptions = [
        { value: 1, label: '1 - Ethereum Mainnet' },
        { value: 10, label: '10 - Optimism' },
        { value: 56, label: '56 - BNB Chain' },
        { value: 137, label: '137 - Polygon' },
        { value: 250, label: '250 - Fantom' },
        { value: 7700, label: '7700 - Canto Network' },
        { value: 42161, label: '42161 - Arbitrum' },
        { value: 43114, label: '43114 - Avalanche' },
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
        <Box m="20px" minHeight="85vh">
            <Header title="ENVIRONMENT" subtitle="Configure and control the active snipe environment" />

            <Formik
                onSubmit={handleFormSubmit}
                initialValues={getInitialValues}
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
                                    <Button type="submit" color="secondary" variant="contained" onClick={() => { handleSaveEnvironmentSettings(values) }}>
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
                                onLoad={() => {
                                    console.log('typography loaded');
                                    //loadInitialValues(setFieldValue);
                                }}
                            >
                                Deactivates the snipe environment, aborting all snipe sessions and discarding states. Connections can now be updated.
                            </Typography>
                        </Box>
                    </form>
                )}
            </Formik>
        </Box>
    );
};

export default EnvironmentEdit;
