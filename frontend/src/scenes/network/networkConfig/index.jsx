import {Box, Button, FormControl, FormControlLabel, Switch, TextField, Typography, useTheme} from "@mui/material";
import {tokens} from "../../../theme";
import {useLocation, useNavigate} from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import useSessionStorage from "../../../utils/useSessionStorage";
import Header from "../../../components/Header";
import {Formik} from "formik";
import Select from "react-select";
import React from "react";
import networkConfigSchema from "../../../data/schemas/networkConfigSchema";
import {validateNetworkConfigValues} from "../../../utils/validators/validateNetworkConfigValues";
import {isDescriptionUnique, stringify} from "../../../utils/utils";
import {chainIdOptions} from "../../../utils/constants";
import defaultNetworkConfigPresets, {ensureDefaults} from "../../../data/defaults/defaultNetworkConfigPresets";

const initialValues = {
    id: undefined,
    description: "",

    chainId: 1,
    hasWebsockets: false,
    hasBlockHeaderSubscription: false,
    hasPendingTransactionSubscription: false,
    hasLogSubscription: false,
    hasMempool: false,

    // sequencer
    hasSequencer: false,
    hasSequencerFeed: false,

    frontRunningIsAllowed: false,
    hasEip1559Support: false,
    evmGasConsumptionFactor: undefined,
    supportsDebugTrace: false,
    avgBlockTimeMs: undefined,
    notes: "",
};

const NetworkConfig = () => {
    const componentName = 'NetworkConfig';
    const log = (message) => console.log(`[${componentName}] ${message}`);

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { state } = useLocation();

    const {
        loadId,
        loadMode,
        origin,
        originId,
    } = (!!state ? state : {});

    const isNonMobile = useMediaQuery("(min-width:600px");
    const navigate = useNavigate();
    const [networkConfigs, setNetworkConfigs] = useSessionStorage('networkConfigs', defaultNetworkConfigPresets);
    ensureDefaults(networkConfigs, setNetworkConfigs);

    const getValuesForId = (id) => {
        try {
            return networkConfigs.filter(o => (
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

    const getInitialValues = (_loadId, _loadMode) => {
        try {
            if(typeof(_loadId) === 'undefined') {
                return initialValues;
            }

            return {
                ...(getValuesForId(_loadId) || initialValues),
                id: (_loadMode && _loadMode === 'edit') ? loadId : undefined,
            }
        } catch(e) {
            log(`Error getting initial values`);
            console.log(e);
            return initialValues;
        }
    }

    const _navigate = (_id) => {
        if(origin && origin === 'connections') {
            navigate(
                '/connections',
                {
                    state: {
                        useEdit: true,
                        useNetworkConfigId: _id,
                        origin: 'network-config',
                        loadId: originId,
                    }
                }
            );
        } else {
            // origin === 'presets'
            navigate('/network-config-presets');
        }
    }

    const handleSave = (values) => {
        let savedId;

        if(!values) {
            log(`Values undefined - cannot save config`);
            window.alert(`Values undefined - cannot save config`);
            return;
        }

        const {description} = values;

        if(!description) {
            log(`description undefined - cannot save config`);
            window.alert(`description undefined - cannot save config`);
            return;
        }

        const {success, message} = validateNetworkConfigValues(values);

        if(!success) {
            log(`Network config fields failed validation: ${message}`);
            window.alert(`Network config fields failed validation: ${message}`);
            return;
        }

        try {
            if(typeof(values.id) !== 'undefined') {
                console.log(`params have id ${values.id}`);
                let index = -1;

                for(let i = 0; i < networkConfigs.length; i++) {
                    const { id } = networkConfigs[i];

                    if(values.id === id) {
                        index = i;
                        break;
                    }
                }

                if(index === -1) {
                    // did not find
                    if(!isDescriptionUnique(description, networkConfigs || [])) {
                        log(`description must be unique - already have an entry for:\n\n${description}`);
                        window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                        return;
                    }

                    networkConfigs.push({...values});
                } else {
                    networkConfigs[index] = {...values};
                }
            } else {
                let maxId = -1;

                if(!isDescriptionUnique(description, networkConfigs || [])) {
                    log(`description must be unique - already have an entry for:\n\n${description}`);
                    window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                    return;
                }

                for(const item of networkConfigs) {
                    if(item && typeof(item.id) !== 'undefined') {
                        if(item.id > maxId) {
                            maxId = item.id;
                        }
                    }
                }

                console.log(`Max id is ${maxId}`);
                const nextId = (typeof(maxId) === 'number') ? maxId + 1 : 1;
                console.log(`Next id is ${nextId}`);

                networkConfigs.push({
                    ...values,
                    id: nextId,
                });

                savedId = nextId;
                values.id = savedId;
            }

            setNetworkConfigs(networkConfigs);
            let useNetworkConfigId;

            if(typeof(values.id) !== 'undefined') {
                useNetworkConfigId = values.id;
                window.alert(`Network Config updated for preset # ${useNetworkConfigId} with description:\n ${values.description}`);
            } else {
                useNetworkConfigId = savedId;
                window.alert(`Network Config saved as preset # ${useNetworkConfigId} with description: \n ${values.description}`);
            }

            return useNetworkConfigId;
        } catch(e) {
            log(`Error saving network config`);
            console.log(e);
            window.alert(`Error saving network config: ${e.toString()}`);
            return undefined;
        }
    }

    const handleFormSubmit = (values) => {
        let savedId;

        const useNetworkConfigId = handleSave(values);

        if(typeof(useNetworkConfigId) !== 'undefined') {
            _navigate(useNetworkConfigId);
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

    return(
        <Box m="20px" minHeight="85vh">
            <Header title="NETWORK CONFIG" subtitle="Create / edit network config preset" />

            <Formik
                onSubmit={handleFormSubmit}
                initialValues={getInitialValues(loadId, loadMode)}
                validationSchema={networkConfigSchema}
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
                                Configuration Options
                            </Typography>

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.hasWebsockets}
                                    onChange={(e) => { setFieldValue( 'hasWebsockets', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="hasWebsockets"
                                />}
                                label="Network supports WebSocket (wss/ws) connection types"
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
                                    checked={values.hasBlockHeaderSubscription}
                                    onChange={(e) => { setFieldValue( 'hasBlockHeaderSubscription', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="hasBlockHeaderSubscription"
                                />}
                                label="Network supports block header subscriptions (requires websockets)"
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
                                    checked={values.hasPendingTransactionSubscription}
                                    onChange={(e) => { setFieldValue( 'hasPendingTransactionSubscription', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="hasPendingTransactionSubscription"
                                />}
                                label="Network supports pending transaction subscriptions (requires websockets)"
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
                                    checked={values.hasLogSubscription}
                                    onChange={(e) => { setFieldValue( 'hasLogSubscription', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="hasLogSubscription"
                                />}
                                label="Network supports event log subscriptions (requires websockets)"
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
                                    checked={values.hasSequencer}
                                    onChange={(e) => { setFieldValue( 'hasSequencer', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="hasSequencer"
                                />}
                                label="Uses a sequencer - guarantees txns are finalized in oreder they are received - no frontrunning"
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
                                    checked={values.hasSequencerFeed}
                                    onChange={(e) => { setFieldValue( 'hasSequencerFeed', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="hasSequencerFeed"
                                />}
                                label="Has a sequencer feed subscription for faster notificatino of transactions"
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
                                    checked={values.hasMempool}
                                    onChange={(e) => { setFieldValue( 'hasMempool', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="hasMempool"
                                />}
                                label="Network has a mempool (requires pending transaction subscriptions)"
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
                                    checked={values.frontRunningIsAllowed}
                                    onChange={(e) => { setFieldValue( 'frontRunningIsAllowed', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="frontRunningIsAllowed"
                                />}
                                label="FrontRunning is supported - requires that network has mempool, pending txns are replacable, and chain doesnt use sequencer"
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
                                    checked={values.hasEip1559Support}
                                    onChange={(e) => { setFieldValue( 'hasEip1559Support', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="hasEip1559Support"
                                />}
                                label="Network supports Type 2 txns (EIP-1559)"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="EVM Gas Consumption Factor - for networks that use higher gas (example: ARB has a factor of approx 24x)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.evmGasConsumptionFactor}
                                name="evmGasConsumptionFactor"
                                error={!!touched.evmGasConsumptionFactor && !!errors.evmGasConsumptionFactor}
                                helperText={touched.evmGasConsumptionFactor && errors.evmGasConsumptionFactor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.supportsDebugTrace}
                                    onChange={(e) => { setFieldValue( 'supportsDebugTrace', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="supportsDebugTrace"
                                />}
                                label="Network supports debug_trace requests"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Average block time (ms)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.avgBlockTimeMs}
                                name="avgBlockTimeMs"
                                error={!!touched.avgBlockTimeMs && !!errors.avgBlockTimeMs}
                                helperText={touched.avgBlockTimeMs && errors.avgBlockTimeMs}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Notes"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.notes}
                                name="notes"
                                error={!!touched.notes && !!errors.notes}
                                helperText={touched.notes && errors.notes}
                                sx={{ gridColumn: "span 4" }}
                            />

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
                    </form>
                )}
            </Formik>
        </Box>
    );
}

export default NetworkConfig;
