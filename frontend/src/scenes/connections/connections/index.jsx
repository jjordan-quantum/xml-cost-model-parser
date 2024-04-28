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
import Header from "../../../components/Header";
import {useLocation, useNavigate} from "react-router-dom";
import useSessionStorage from "../../../utils/useSessionStorage";
import {tokens} from "../../../theme";
import React from "react";
import connectionsSchema from "../../../data/schemas/connectionsSchema";
import Select from "react-select";
import {getRandomInt, isDescriptionUnique, stringify} from "../../../utils/utils";
import defaultNetworkConfigPresets, {ensureDefaults} from "../../../data/defaults/defaultNetworkConfigPresets";
import {validateConnectionValues} from "../../../utils/validators/validateConnectionValues";
import {chainIdOptions} from "../../../utils/constants";
import {ensureDefaultConnections} from "../../../data/defaults/defaultConnections";

const initialValues = {
    id: undefined,
    description: "",
    chainId: 1,
    httpsProvider: "",
    wssProvider: "",
    httpsProviderFlashbots: "",
    httpsProviderDebugTrace: "",

    alwaysSendPrivateTxn: false,
    doNotStreamBlocks: false,
    doNotStreamMempoolGasPrices: false,
    useNextBlockNumberForEthCall: false,

    networkConfigId: undefined,
    hasNetworkConfig: true,
};

const Connections = () => {
    const componentName = 'Connections';
    const log = (message) => console.log(`[${componentName}] ${message}`);
    const componentId = getRandomInt();

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { state } = useLocation();

    const {
        loadId,
        loadMode,
        origin,
        useNetworkConfigId,
    } = (!!state ? state : {});

    const isNonMobile = useMediaQuery("(min-width:600px");
    const navigate = useNavigate();
    const [connections, setConnections] = useSessionStorage('connections', []);
    const [networkConfigs, setNetworkConfigs] = useSessionStorage('networkConfigs', []);
    const [connectionEdits, setConnectionEdits] = useSessionStorage('connectionEdits', []);
    const [newConnectionEdit, setNewConnectionEdit] = useSessionStorage('newConnectionEdit', undefined);

    if(networkConfigs.length === 0) {
        setNetworkConfigs(defaultNetworkConfigPresets);
    }

    ensureDefaults(networkConfigs, setNetworkConfigs);
    ensureDefaultConnections(connections, setConnections);

    const getValuesForId = (id) => {
        try {
            return connections.filter(o => (
                o
                && typeof(o.id) !== 'undefined'
                && (o.id === id)
            ))[0];
        } catch(e) {
            log(`Error getting values for id`);
            console.log(e);
            return undefined;
        }
    }

    const getEditsForId = (id) => {
        try {
            return connectionEdits.filter(o => (
                o
                && typeof(o.id) !== 'undefined'
                && (o.id === id)
            ))[0];
        } catch(e) {
            log(`Error getting edit values for id ${id}`);
            console.log(e);
            return undefined;
        }
    }

    const updateEditForId = (editId, values) => {
        let foundEdit = false;

        try {
            for(let i = 0; i < connectionEdits.length; i++) {
                if(connectionEdits[i].id === editId) {
                    connectionEdits[i] = {...values};
                    foundEdit = true;
                    break;
                }
            }

            if(!foundEdit) {
                connectionEdits.push({...values});
            }

            setConnectionEdits(connectionEdits);
        } catch(e) {
            log(`Error updating edit values for id ${editId}`);
            console.log(e);
            return undefined;
        }
    }

    const saveEdit = (values) => {
        // save edit
        if(typeof(values.id) !== 'undefined') {
            // pre-existing snipe session -> update edit for existing
            updateEditForId(values.id, values);
        } else {
            // new snipe session -> update edit for new
            setNewConnectionEdit(values);
        }
    }

    // =================================================================================================================
    //
    //  set up / initialize values
    //
    // =================================================================================================================

    let _initialValues = initialValues;

    try {
        if(origin && origin === 'network-config') {
            if(typeof(loadId) === 'undefined') {
                log('loadId is undefined - checking for edit');
                // snipe session is new and does not yet have an id
                // resolve values for new edit - fall back to initial values
                const editValues = {...(newConnectionEdit || initialValues)};

                // snipe session is new - use given settings id's if provided
                _initialValues = {
                    ...editValues,
                    networkConfigId: (typeof(useNetworkConfigId) !== 'undefined') ? useNetworkConfigId : editValues.networkConfigId,
                }
            } else {
                log(`Loading id ${loadId} from edits`);
                // resolve values for id - first check edits
                const editForId = {...(getEditsForId(loadId) || getValuesForId(loadId))};

                // snipe session is existing - use given settings id's if provided
                _initialValues = {
                    ...editForId,
                    networkConfigId: (typeof(useNetworkConfigId) !== 'undefined') ? useNetworkConfigId : editForId.networkConfigId,
                }
            }
        } else {
            if(typeof(loadId) !== 'undefined') {
                _initialValues = {
                    ...(getValuesForId(loadId) || initialValues),
                    id: (loadMode && loadMode === 'edit') ? loadId : undefined,
                }
            }
        }
    } catch(e) {
        log(`Error setting up initial form values`);
        console.log(e);
        window.alert(`Error setting up initial form values: ${e.toString()}`);
    }

    const getInitialValues = (_loadId, _loadMode) => {
        return _initialValues;
        // if(typeof(_loadId) === 'undefined') {
        //     return initialValues;
        // }
        //
        // return {
        //     ...(getValuesForId(loadId) || initialValues),
        //     id: (_loadMode && _loadMode === 'edit') ? loadId : undefined,
        // }
    }

    // =================================================================================================================
    //
    //  network config actions handlers
    //
    // =================================================================================================================

    const handleEditNetworkConfig = (id, values) => {
        log(`Editing network config`);

        if(typeof(id) === 'undefined') {
            log('id undefined - nothing to edit');
            return;
        }

        saveEdit(values);

        navigate(
            '/network-config',
            {
                state: {
                    loadId: id,  // id of settings to be loaded in edit view
                    loadMode: 'edit',  // mode - indicating to edit existing settings
                    origin: 'connections',  // origin - will return here on save
                    originId: values.id  // session id to load, upon return, otherwise load from newEdit storage
                }
            }
        );
    }

    const handleDuplicateNetworkConfig = (id, values) => {
        log(`Duplicating network config`);

        if(typeof(id) === 'undefined') {
            log('id undefined - nothing to duplicate');
            return;
        }

        saveEdit(values);

        navigate(
            '/network-config',
            {
                state: {
                    loadId: id,  // id of settings to be loaded in edit view
                    loadMode: 'duplicate',  // mode - indicating to edit existing settings
                    origin: 'connections',  // origin - will return here on save
                    originId: values.id  // session id to load, upon return, otherwise load from newEdit storage
                }
            }
        );
    }

    const handleCreateNetworkConfig = (values) => {
        log(`Creating network config`);
        saveEdit(values);

        navigate(
            '/network-config',
            {
                state: {
                    loadMode: 'new',  // mode - indicating to edit existing settings
                    origin: 'connections',  // origin - will return here on save
                    originId: values.id  // session id to load, upon return, otherwise load from newEdit storage
                }
            }
        );
    }

    // =================================================================================================================
    //
    //  form submission
    //
    // =================================================================================================================

    const _navigate = (_id) => {
        if(origin && origin === 'environment') {
            navigate(
                '/environment',
                { state: { useEdit: true, useConnectionId: _id } }
            );
        } else {
            // origin === 'presets'
            navigate('/connections-presets');
        }
    }

    const handleSave = (values) => {
        let savedId;

        if(!values) {
            log(`Values undefined - cannot save connection`);
            window.alert(`Values undefined - cannot save connection`);
            return;
        }

        const {description} = values;

        if(!description) {
            log(`description undefined - cannot save connection`);
            window.alert(`description undefined - cannot save connection`);
            return;
        }

        log(`saving connections with id: ${values.id}`);
        const {success, message} = validateConnectionValues(values);

        try {
            if(typeof(values.id) !== 'undefined') {
                log(`params have id ${values.id}`);
                let index = -1;

                for(let i = 0; i < connections.length; i++) {
                    const { id } = connections[i];

                    if(values.id === id) {
                        index = i;
                        break;
                    }
                }

                if(index === -1) {
                    // did not find
                    if(!isDescriptionUnique(description, connections || [])) {
                        log(`description must be unique - already have an entry for:\n\n${description}`);
                        window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                        return;
                    }

                    connections.push({...values});
                } else {
                    connections[index] = {...values};
                }
            } else {
                let maxId = -1;

                if(!isDescriptionUnique(description, connections || [])) {
                    log(`description must be unique - already have an entry for:\n\n${description}`);
                    window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                    return;
                }

                for(const item of connections) {
                    if(item && typeof(item.id) !== 'undefined') {
                        if(item.id > maxId) {
                            maxId = item.id;
                        }
                    }
                }

                // log(`Max id is ${maxId}`);
                const nextId = (typeof(maxId) === 'number') ? maxId + 1 : 1;
                // log(`Next id is ${nextId}`);

                connections.push({
                    ...values,
                    id: nextId,
                });

                savedId = nextId;
                values.id = savedId;
            }

            log(`Saving connections: ${JSON.stringify(connections)}`);
            setConnections(connections);
            let useConnectionId;

            if(typeof(values.id) !== 'undefined') {
                useConnectionId = values.id;
                window.alert(`Connections updated for preset # ${useConnectionId} with description:\n ${values.description} ${success ? '' : ('\n\nWARNING: Settings failed validation: ' + message + '\nThey will still be saved, but will not pass validation if sent to sniper app')}`);
            } else {
                useConnectionId = savedId;
                window.alert(`Connections saved as preset # ${useConnectionId} with description: \n ${values.description} ${success ? '' : ('\n\nWARNING: Settings failed validation: ' + message + '\nThey will still be saved, but will not pass validation if sent to sniper app')}`);
            }

            return useConnectionId;
        } catch(e) {
            log(`Error saving connections`);
            console.log(e);
            window.alert(`Error saving connections: ${e.toString()}`);
        }
    }

    const handleFormSubmit = (values) => {
        let savedId;

        const useConnectionId = handleSave(values);

        if(typeof(useConnectionId) !== 'undefined') {
            _navigate(useConnectionId);
        }
    }

    const handleCancel = (values) => {
        _navigate(values.id);
    }

    const handleReset = (values, setFieldValue) => {
        let useId = values.id;

        if(typeof(useId) === 'undefined') {
            window.alert(`ID not saved - cannot reset form`);
            return;
        }

        const savedValues = getValuesForId(useId);

        if(!savedValues) {
            window.alert(`No saved values found for the given id: ${useId}`);
            return;
        }

        if(window.confirm(`Are you sure you want to reset the form back to the last saved values?\n\n${stringify(savedValues)}`)) {
            for(const key of Object.keys(initialValues)) {
                setFieldValue(key, savedValues[key], false);
            }
        }
    }

    // =================================================================================================================
    //
    //  select options
    //
    // =================================================================================================================

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

    const networkConfigOptions = networkConfigs.map((_config) => {
        return {
            value: _config.id,
            label: `${_config.id} - ${_config.description} - Chain ID ${_config.chainId}`,
        }
    });

    return(
        <Box m="20px" minHeight="85vh">
            <Header title="CONNECTIONS" subtitle="Create / edit connections preset" />

            <Formik
                onSubmit={handleFormSubmit}
                initialValues={getInitialValues(loadId, loadMode)}
                validationSchema={connectionsSchema}
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
                            {/* TODO - use a select box, with predefined routers from contracts page */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Preset ID"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.id}
                                InputProps={{
                                    readOnly: true,
                                }}
                                name="id"
                                error={!!touched.id && !!errors.id}
                                helperText={touched.id && errors.id}
                                sx={{ gridColumn: "span 1" }}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Please provide a brief description / name for the preset"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.description}
                                name="description"
                                error={!!touched.description && !!errors.description}
                                helperText={touched.description && errors.description}
                                sx={{ gridColumn: "span 3" }}
                            />

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
                                    onChange={(option) => { setFieldValue( 'chainId', option.value, false  ) }}
                                    onBlur={handleBlur}
                                    styles={customStyles}
                                />
                            </FormControl>

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Select Network Config
                            </Typography>

                            <FormControl sx={{
                                gridColumn: "span 3"
                            }}>
                                <Select
                                    options={networkConfigOptions}
                                    name="networkConfigId"
                                    value={(networkConfigOptions ? networkConfigOptions.find(option => option.value === values.networkConfigId) : '')}
                                    onChange={(option) => { setFieldValue( 'networkConfigId', option.value, false  ) }}
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
                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleEditNetworkConfig(values.networkConfigId, values) }}>
                                        EDIT
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleDuplicateNetworkConfig(values.networkConfigId, values) }}>
                                        COPY
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleCreateNetworkConfig(values) }}>
                                        NEW
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Provider URLs
                            </Typography>

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="WebSocket (ws/wss) Provider - will get priority over HTTP/HTTPS for sending requests"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.wssProvider}
                                name="wssProvider"
                                error={!!touched.wssProvider && !!errors.wssProvider}
                                helperText={touched.wssProvider && errors.wssProvider}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="HTTPS Provider"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.httpsProvider}
                                name="httpsProvider"
                                error={!!touched.httpsProvider && !!errors.httpsProvider}
                                helperText={touched.httpsProvider && errors.httpsProvider}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="HTTPS Provider for Tracing (must have debug/trace apis enabled) - will only be used for tracing txns"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.httpsProviderDebugTrace}
                                name="httpsProviderDebugTrace"
                                error={!!touched.httpsProviderDebugTrace && !!errors.httpsProviderDebugTrace}
                                helperText={touched.httpsProviderDebugTrace && errors.httpsProviderDebugTrace}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="HTTPS Provider for MEV - will only be used for bundle preparation in the event that above HTTPS Provider is blank"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.httpsProviderFlashbots}
                                name="httpsProviderFlashbots"
                                error={!!touched.httpsProviderFlashbots && !!errors.httpsProviderFlashbots}
                                helperText={touched.httpsProviderFlashbots && errors.httpsProviderFlashbots}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Additional Connection Options
                            </Typography>

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.alwaysSendPrivateTxn}
                                    onChange={(e) => { setFieldValue( 'alwaysSendPrivateTxn', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="alwaysSendPrivateTxn"
                                />}
                                label="Always Send Private Txn if Slippage Not Selected (only for Mainnet)"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.doNotStreamBlocks}
                                    onChange={(e) => { setFieldValue( 'doNotStreamBlocks', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="doNotStreamBlocks"
                                />}
                                label="Do Not Stream New Blocks on Command Line (streams blocksby default)"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.doNotStreamMempoolGasPrices}
                                    onChange={(e) => { setFieldValue( 'doNotStreamMempoolGasPrices', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="doNotStreamMempoolGasPrices"
                                />}
                                label="Do Not Stream Mempool Gas Prices on Command Line (will stream by default)"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/*<FormControlLabel*/}
                            {/*    // fullWidth*/}
                            {/*    variant="filled"*/}
                            {/*    // type="text"*/}
                            {/*    control={ <Switch*/}
                            {/*        checked={values.useNextBlockNumberForEthCall}*/}
                            {/*        onChange={(e) => { setFieldValue( 'useNextBlockNumberForEthCall', e.target.checked, false  ) }}*/}
                            {/*        color="secondary"*/}
                            {/*        name="useNextBlockNumberForEthCall"*/}
                            {/*    />}*/}
                            {/*    label="Use Next Block"*/}
                            {/*    //value={values.autoApproveRouter}*/}
                            {/*    // error={!!touched.useMevExecutor && !!errors.useMevExecutor}*/}
                            {/*    // helperText={touched.useMevExecutor && errors.useMevExecutor}*/}
                            {/*    sx={{ gridColumn: "span 1" }}*/}
                            {/*/>*/}

                        </Box>
                        <Box display="flex" justifyContent="end" mt="10px" p="10px">
                            <Button color="secondary" variant="contained" sx={{ml: "5px", mr: "5px"}} onClick={() => { handleSave(values); }}>
                                Save
                            </Button>
                            <Button color="secondary" variant="contained" sx={{ml: "5px", mr: "5px"}} onClick={() => { handleFormSubmit(values); }}>
                                Save and Return
                            </Button>
                            <Button color="secondary" variant="contained" sx={{ml: "5px", mr: "5px"}} onClick={() => { handleReset(values, setFieldValue); }}>
                                Reset
                            </Button>
                            <Button color="secondary" variant="contained" sx={{ml: "5px", mr: "5px"}} onClick={() => { handleCancel(values); }}>
                                Cancel
                            </Button>
                        </Box>

                        {/*<Box display="flex" justifyContent="end" mt="10px" p="10px">*/}
                        {/*    <Button color="secondary" variant="contained" onClick={() => { handleCancel(values); }}>*/}
                        {/*        Cancel*/}
                        {/*    </Button>*/}
                        {/*</Box>*/}
                    </form>
                )}
            </Formik>
        </Box>
    );
};

export default Connections;
