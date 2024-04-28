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
import gasPriceSettingsSchema from "../../../data/schemas/gasPriceSettingsSchema";
import {tokens} from "../../../theme";
import React from "react";
import Select, { Option, ReactSelectProps } from 'react-select'
import secondTriggerWalletSettingsSchema from "../../../data/schemas/secondTriggerWalletSettingsSchema";
import {validateSecondTriggerWalletSettings} from "../../../utils/validators/validateSecondTriggerWalletSettings";
import {isDescriptionUnique, stringify} from "../../../utils/utils";

const initialValues = {
    id: undefined,
    description: "",


    useSecondaryTriggerWallet: false,
    secondaryTriggerWallet: "",
    txValueForSecondaryTriggerWallet: "",
    useSlippageForSecondaryTriggerWallet: false,
    slippagePercentForSecondaryTriggerWallet: "",

    usePrivateTxnsForSecondaryTriggerWalletSameBlock: false,
    usePrivateTxnsForSecondaryTriggerWallet: false,
    doNotMatchGweiSecondaryTriggerWallet: false,
};

const SecondTriggerWalletSettings = () => {
    const componentName = 'SecondTriggerWalletSettings';
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
    const [secondTriggerWalletSettings, setSecondTriggerWalletSettings] = useSessionStorage('secondTriggerWalletSettings', []);

    const getValuesForId = (id) => {
        try {
            return secondTriggerWalletSettings.filter(o => (
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
                id: (_loadMode && _loadMode === 'edit') ? _loadId : undefined,
            }
        } catch(e) {
            log(`Error getting initial values`);
            console.log(e);
            return initialValues;
        }
    }

    const _navigate = (_id) => {
        if(origin && ['session', 'autobot'].includes(origin)) {
            navigate(
                '/' + origin,
                {
                    state: {
                        origin: 'settings',
                        loadId: originId,
                        useSecondTriggerWalletSettingsId: _id,
                    }
                }
            );
        } else {
            navigate('/second-trigger-wallet-settings-presets');
        }
    }

    const handleSave = (values) => {
        let savedId;

        if(!values) {
            log(`Values undefined - cannot save settings`);
            window.alert(`Values undefined - cannot save settings`);
            return;
        }

        const {description} = values;

        if(!description) {
            log(`description undefined - cannot save settings`);
            window.alert(`description undefined - cannot save settings`);
            return;
        }

        // TODO - validate gas price settings

        const {success, message} = validateSecondTriggerWalletSettings(values);

        try {
            if(typeof(values.id) !== 'undefined') {
                //console.log(`params have id ${values.id}`);
                let index = -1;

                for(let i = 0; i < secondTriggerWalletSettings.length; i++) {
                    const { id } = secondTriggerWalletSettings[i];

                    if(values.id === id) {
                        index = i;
                        break;
                    }
                }

                if(index === -1) {
                    // did not find
                    if(!isDescriptionUnique(description, secondTriggerWalletSettings || [])) {
                        log(`description must be unique - already have an entry for:\n\n${description}`);
                        window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                        return;
                    }

                    secondTriggerWalletSettings.push({...values});
                } else {
                    secondTriggerWalletSettings[index] = {...values};
                }
            } else {
                let maxId = -1;

                if(!isDescriptionUnique(description, secondTriggerWalletSettings || [])) {
                    log(`description must be unique - already have an entry for:\n\n${description}`);
                    window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                    return;
                }

                for(const item of secondTriggerWalletSettings) {
                    if(item && typeof(item.id) !== 'undefined') {
                        if(item.id > maxId) {
                            maxId = item.id;
                        }
                    }
                }

                //console.log(`Max id is ${maxId}`);
                const nextId = (typeof(maxId) === 'number') ? maxId + 1 : 1;
                //console.log(`Next id is ${nextId}`);

                secondTriggerWalletSettings.push({
                    ...values,
                    id: nextId,
                });

                savedId = nextId;
                values.id = savedId;
            }

            setSecondTriggerWalletSettings(secondTriggerWalletSettings);
            let useSecondTriggerWalletSettingsId;

            if(typeof(values.id) !== 'undefined') {
                useSecondTriggerWalletSettingsId = values.id;

                window.alert(`Second Trigger Wallet Settings updated for preset # ${useSecondTriggerWalletSettingsId} with description:\n ${values.description} 
                    ${success ? '\nSaved settings: ' + stringify(values) : ('\n\nWARNING: Settings failed validation: ' + message + '\nThey will still be saved, but will not pass validation if sent to sniper app')}
                `);
            } else {
                useSecondTriggerWalletSettingsId = savedId;

                window.alert(`Second Trigger Wallet Settings saved as preset # ${useSecondTriggerWalletSettingsId} with description: \n ${values.description} 
                    ${success ? '\nSaved settings: ' + stringify(values) : ('\n\nWARNING: Settings failed validation: ' + message + '\nThey will still be saved, but will not pass validation if sent to sniper app')}
                `);
            }

            return useSecondTriggerWalletSettingsId;
        } catch(e) {
            log(`Error saving second trigger wallet settings`);
            console.log(e);
            window.alert(`Error saving second trigger wallet settings: ${e.toString()}`);
            return undefined;
        }
    }

    const handleFormSubmit = (values) => {
        let savedId;

        const useSecondTriggerWalletSettingsId = handleSave(values);

        if(typeof(useSecondTriggerWalletSettingsId) !== 'undefined') {
            _navigate(useSecondTriggerWalletSettingsId);
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

    return(
        <Box m="20px" minHeight="85vh">
            <Header title="SECONDARY TRIGGER WALLET SETTINGS" subtitle="Create / edit secondary trigger wallet settings preset" />

            <Formik
                onSubmit={handleFormSubmit}
                initialValues={getInitialValues(loadId, loadMode)}
                validationSchema={secondTriggerWalletSettingsSchema}
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

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useSecondaryTriggerWallet}
                                    onChange={(e) => { setFieldValue( 'useSecondaryTriggerWallet', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useSecondaryTriggerWallet"
                                />}
                                label="Use Secondary Trigger Wallet"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Tx Value for Secondary Trigger Wallet (leave blank to use default tx value)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.txValueForSecondaryTriggerWallet}
                                name="txValueForSecondaryTriggerWallet"
                                error={!!touched.txValueForSecondaryTriggerWallet && !!errors.txValueForSecondaryTriggerWallet}
                                helperText={touched.txValueForSecondaryTriggerWallet && errors.txValueForSecondaryTriggerWallet}
                                sx={{ gridColumn: "span 4" }}
                            />


                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useSlippageForSecondaryTriggerWallet}
                                    onChange={(e) => { setFieldValue( 'useSlippageForSecondaryTriggerWallet', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useSlippageForSecondaryTriggerWallet"
                                />}
                                label="Use Slippage for Secondary Trigger Wallet"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Slippage Percent for Secondary Trigger Wallet"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.slippagePercentForSecondaryTriggerWallet}
                                name="slippagePercentForSecondaryTriggerWallet"
                                error={!!touched.slippagePercentForSecondaryTriggerWallet && !!errors.slippagePercentForSecondaryTriggerWallet}
                                helperText={touched.slippagePercentForSecondaryTriggerWallet && errors.slippagePercentForSecondaryTriggerWallet}
                                sx={{ gridColumn: "span 3" }}
                            />


                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.usePrivateTxnsForSecondaryTriggerWalletSameBlock}
                                    onChange={(e) => { setFieldValue( 'usePrivateTxnsForSecondaryTriggerWalletSameBlock', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="usePrivateTxnsForSecondaryTriggerWalletSameBlock"
                                />}
                                label="Use Private Txns for Second Trigger Wallet for Same Block Snipe"
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
                                    checked={values.usePrivateTxnsForSecondaryTriggerWallet}
                                    onChange={(e) => { setFieldValue( 'usePrivateTxnsForSecondaryTriggerWallet', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="usePrivateTxnsForSecondaryTriggerWallet"
                                />}
                                label="Use Private Txns for Second Trigger Wallet for Second Block Snipe / Gas Estimation / Failsafe"
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
                                    checked={values.doNotMatchGweiSecondaryTriggerWallet}
                                    onChange={(e) => { setFieldValue( 'doNotMatchGweiSecondaryTriggerWallet', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="doNotMatchGweiSecondaryTriggerWallet"
                                />}
                                label="Don't Match Gwei for Secondary Trigger Wallet (when using same block snipe)"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
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
};

export default SecondTriggerWalletSettings;
