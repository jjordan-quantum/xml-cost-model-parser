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
import Select, { Option, ReactSelectProps } from 'react-select'
import {validateGasPriceSettings} from "../../../utils/validators/validateGasPriceSettings";
import {isDescriptionUnique, stringify} from "../../../utils/utils";
import botGasPriceSettingsSchema from "../../../data/schemas/botGasPriceSettingsSchema";

const initialValues = {
    id: undefined,
    description: "",
    txType: "",
    gasPrice: "",
    txMaxFeePerGas: "",
    txMaxPriorityFeePerGas: "",
    frontRun: false,
    maxGasPriceForFrontRunning: "",
    onlyFrontRunSimilar: false,
};

const BotGasPriceSettings = () => {
    const componentName = 'BotGasPriceSettings';
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
    const [botGasPriceSettings, setBotGasPriceSettings] = useSessionStorage('botGasPriceSettings', []);

    const getValuesForId = (id) => {
        try {
            return botGasPriceSettings.filter(o => (
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
                        useGasPriceSettingsId: _id,
                    }
                }
            );
        } else {
            navigate('/bot-gas-price-settings-presets');
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

        const {success, message} = validateGasPriceSettings(values);

        // TODO - validate gas price settings
        try {
            if(typeof(values.id) !== 'undefined') {
                //console.log(`params have id ${values.id}`);
                let index = -1;

                for(let i = 0; i < botGasPriceSettings.length; i++) {
                    const { id } = botGasPriceSettings[i];

                    if(values.id === id) {
                        index = i;
                        break;
                    }
                }

                if(index === -1) {
                    // did not find
                    if(!isDescriptionUnique(description, botGasPriceSettings || [])) {
                        log(`description must be unique - already have an entry for:\n\n${description}`);
                        window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                        return;
                    }

                    botGasPriceSettings.push({...values});
                } else {
                    botGasPriceSettings[index] = {...values};
                }
            } else {
                let maxId = -1;

                if(!isDescriptionUnique(description, botGasPriceSettings || [])) {
                    log(`description must be unique - already have an entry for:\n\n${description}`);
                    window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                    return;
                }

                for(const item of botGasPriceSettings) {
                    if(item && typeof(item.id) !== 'undefined') {
                        if(item.id > maxId) {
                            maxId = item.id;
                        }
                    }
                }

                //console.log(`Max id is ${maxId}`);
                const nextId = (typeof(maxId) === 'number') ? maxId + 1 : 1;
                //console.log(`Next id is ${nextId}`);

                botGasPriceSettings.push({
                    ...values,
                    id: nextId,
                });

                savedId = nextId;
                values.id = savedId;
            }

            setBotGasPriceSettings(botGasPriceSettings);
            let useGasPriceSettingsId;

            if(typeof(values.id) !== 'undefined') {
                useGasPriceSettingsId = values.id;

                window.alert(`Gas Price Settings updated for preset # ${useGasPriceSettingsId} with description:\n ${values.description} 
                    ${success ? '\nSaved settings: ' + stringify(values) : ('\nWARNING: Settings failed validation: ' + message + '\n\nThey will still be saved, but will not pass validation if sent to sniper app')}
                    
                `);
            } else {
                useGasPriceSettingsId = savedId;

                window.alert(`Gas Price Settings saved as preset # ${useGasPriceSettingsId} with description: \n ${values.description} 
                    ${success ? '\nSaved settings: ' + stringify(values) : ('\nWARNING: Settings failed validation: ' + message + '\n\nThey will still be saved, but will not pass validation if sent to sniper app')}
                `);
            }

            return useGasPriceSettingsId;
        } catch(e) {
            log(`Error saving gas price settings`);
            console.log(e);
            window.alert(`Error saving gas price settings: ${e.toString()}`);
            return undefined;
        }
    }

    const handleFormSubmit = (values) => {
        let savedId;

        const useGasPriceSettingsId = handleSave(values);

        if(typeof(useGasPriceSettingsId) !== 'undefined') {
            _navigate(useGasPriceSettingsId);
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

    const selectOptions = [
        { value: '0', label: 'Legacy' },
        { value: '2', label: 'EIP-1559' },
    ];

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
            <Header title="BOT GAS PRICE SETTINGS" subtitle="Create / edit bot gas price settings preset" />

            <Formik
                onSubmit={handleFormSubmit}
                initialValues={getInitialValues(loadId, loadMode)}
                validationSchema={botGasPriceSettingsSchema}
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
                                Transaction Type
                            </Typography>

                            <FormControl sx={{
                                gridColumn: "span 4"
                            }}>
                                <Select
                                    options={selectOptions}
                                    name="txType"
                                    value={(selectOptions ? selectOptions.find(option => option.value === values.txType) : '')}
                                    onChange={(option) => { setFieldValue( 'txType', option.value, false  ) }}
                                    onBlur={handleBlur}
                                    styles={customStyles}
                                />
                            </FormControl>


                            {/*<TextField*/}
                            {/*    fullWidth*/}
                            {/*    variant="filled"*/}
                            {/*    type="text"*/}
                            {/*    label="Tx Type"*/}
                            {/*    onBlur={handleBlur}*/}
                            {/*    onChange={handleChange}*/}
                            {/*    value={values.txType}*/}
                            {/*    name="txType"*/}
                            {/*    error={!!touched.txType && !!errors.txType}*/}
                            {/*    helperText={touched.txType && errors.txType}*/}
                            {/*    sx={{ gridColumn: "span 4" }}*/}
                            {/*/>*/}
                            {/*<FormControl*/}
                            {/*    sx={{*/}
                            {/*        gridColumn: "span 4",*/}
                            {/*    }}*/}
                            {/*>*/}
                            {/*    /!*<FormLabel >Transaction Type</FormLabel>*!/*/}
                            {/*    <RadioGroup*/}
                            {/*        variant="filled"*/}
                            {/*        aria-labelledby="demo-radio-buttons-group-label"*/}
                            {/*        defaultValue="0"*/}
                            {/*        name="txType"*/}
                            {/*        value={values.txType}*/}
                            {/*        onChange={handleChange}*/}
                            {/*        sx={{*/}
                            {/*            gridColumn: "span 4",*/}
                            {/*        }}*/}
                            {/*    >*/}
                            {/*        <FormControlLabel*/}
                            {/*            value="0"*/}
                            {/*            control={*/}
                            {/*                <Radio*/}
                            {/*                    sx={{*/}
                            {/*                        // color: colors.blueAccent[700],*/}
                            {/*                        '&.Mui-checked': {*/}
                            {/*                            color: colors.greenAccent[400],*/}
                            {/*                        }*/}
                            {/*                    }}*/}
                            {/*                />*/}
                            {/*            }*/}
                            {/*            label="Type 0 - Legacy"*/}
                            {/*        />*/}
                            {/*        <FormControlLabel*/}
                            {/*            value="2"*/}
                            {/*            control={*/}
                            {/*                <Radio*/}
                            {/*                    sx={{*/}
                            {/*                        // color: colors.blueAccent[700],*/}
                            {/*                        '&.Mui-checked': {*/}
                            {/*                            color: colors.greenAccent[400],*/}
                            {/*                        }*/}
                            {/*                    }}*/}
                            {/*                />*/}
                            {/*            }*/}
                            {/*            label="Type 2 - EIP-1559"*/}
                            {/*        />*/}
                            {/*    </RadioGroup>*/}
                            {/*</FormControl>*/}

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Legacy Gas Price
                            </Typography>

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Gas Price (for legacy tx - type 0)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.gasPrice}
                                name="gasPrice"
                                error={!!touched.gasPrice && !!errors.gasPrice}
                                helperText={touched.gasPrice && errors.gasPrice}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                EIP-1559 Gas Price
                            </Typography>

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Max Fee Per Gas (For EIP-1559 tx - type 2)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.txMaxFeePerGas}
                                name="txMaxFeePerGas"
                                error={!!touched.txMaxFeePerGas && !!errors.txMaxFeePerGas}
                                helperText={touched.txMaxFeePerGas && errors.txMaxFeePerGas}
                                sx={{ gridColumn: "span 4" }}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Max Priority Fee Per Gas (For EIP-1559 tx - type 2)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.txMaxPriorityFeePerGas}
                                name="txMaxPriorityFeePerGas"
                                error={!!touched.txMaxPriorityFeePerGas && !!errors.txMaxPriorityFeePerGas}
                                helperText={touched.txMaxPriorityFeePerGas && errors.txMaxPriorityFeePerGas}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Frontrunning (Not currently supported for Bot)
                            </Typography>

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.frontRun}
                                    onChange={(e) => { setFieldValue( 'frontRun', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="frontRun"
                                />}
                                label="Use Frontrunning"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Max Gas Price for Frontrunning"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.maxGasPriceForFrontRunning}
                                name="maxGasPriceForFrontRunning"
                                error={!!touched.maxGasPriceForFrontRunning && !!errors.maxGasPriceForFrontRunning}
                                helperText={touched.maxGasPriceForFrontRunning && errors.maxGasPriceForFrontRunning}
                                sx={{ gridColumn: "span 3" }}
                            />
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.onlyFrontRunSimilar}
                                    onChange={(e) => { setFieldValue( 'onlyFrontRunSimilar', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="onlyFrontRunSimilar"
                                />}
                                label="Only Frontrun Txns Targeting the Same Token"
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

export default BotGasPriceSettings;
