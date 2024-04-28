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
import vehicleClassSchema from "../../../data/schemas/vehicleClassSchema";

const initialValues = {
    id: undefined,
    vehicleClass: "",
    description: "",
};

const VehicleClass = () => {
    const componentName = 'VehicleClass';
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
    const [vehicleClasses, setVehicleClasses] = useSessionStorage('vehicleClasses', []);

    const getValuesForId = (id) => {
        try {
            return vehicleClasses.filter(o => (
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
        if(origin) {
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
            navigate('/vehicle-classes');
        }
    }

    const handleSave = (values) => {
        let savedId;

        if(!values) {
            log(`Values undefined - cannot save settings`);
            window.alert(`Values undefined - cannot save settings`);
            return;
        }

        const {description, vehicleClass} = values;

        if(!description) {
            log(`description undefined - cannot save settings`);
            window.alert(`description undefined - cannot save settings`);
            return;
        }

        if(!vehicleClass) {
            log(`vehicleClass undefined - cannot save settings`);
            window.alert(`vehicleClass undefined - cannot save settings`);
            return;
        }

        //const {success, message} = validateGasPriceSettings(values);

        // TODO - validate vehicle type
        try {
            if(typeof(values.id) !== 'undefined') {
                //console.log(`params have id ${values.id}`);
                let index = -1;

                for(let i = 0; i < vehicleClasses.length; i++) {
                    const { id } = vehicleClasses[i];

                    if(values.id === id) {
                        index = i;
                        break;
                    }
                }

                if(index === -1) {
                    if((vehicleClasses || []).map((p) => p.vehicleClass.toLowerCase()).includes(vehicleClass.toLowerCase())) {
                        log(`vehicleClass must be unique - already have an entry for:\n\n${vehicleClass}`);
                        window.alert(`vehicleClass must be unique - already have an entry for:\n\n${vehicleClass}`);
                        return;
                    }

                    vehicleClasses.push({...values});
                } else {
                    vehicleClasses[index] = {...values};
                }
            } else {
                let maxId = -1;

                if((vehicleClasses || []).map((p) => p.vehicleClass.toLowerCase()).includes(vehicleClass.toLowerCase())) {
                    log(`vehicleClass must be unique - already have an entry for:\n\n${vehicleClass}`);
                    window.alert(`vehicleClass must be unique - already have an entry for:\n\n${vehicleClass}`);
                    return;
                }

                for(const item of vehicleClasses) {
                    if(item && typeof(item.id) !== 'undefined') {
                        if(item.id > maxId) {
                            maxId = item.id;
                        }
                    }
                }

                //console.log(`Max id is ${maxId}`);
                const nextId = (typeof(maxId) === 'number') ? maxId + 1 : 1;
                //console.log(`Next id is ${nextId}`);

                vehicleClasses.push({
                    ...values,
                    id: nextId,
                });

                savedId = nextId;
                values.id = savedId;
            }

            setVehicleClasses(vehicleClasses);
            let useVehicleClassId;

            if(typeof(values.id) !== 'undefined') {
                useVehicleClassId = values.id;
                window.alert(`Vehicle Classes updated for preset # ${useVehicleClassId} with description:\n ${values.description} and class ${vehicleClass}`);
            } else {
                useVehicleClassId = savedId;
                window.alert(`Vehicle Classes updated for preset # ${useVehicleClassId} with description:\n ${values.description} and class ${vehicleClass}`);
            }

            return useVehicleClassId;
        } catch(e) {
            log(`Error saving vehicle class`);
            console.log(e);
            window.alert(`Error saving vehicle class: ${e.toString()}`);
            return undefined;
        }
    }

    const handleFormSubmit = (values) => {
        let savedId;

        const useVehicleClassId = handleSave(values);

        if(typeof(useVehicleClassId) !== 'undefined') {
            _navigate(useVehicleClassId);
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
            <Header title="VEHICLE CLASS" subtitle="Create / edit vehicle classes" />

            <Formik
                onSubmit={handleFormSubmit}
                initialValues={getInitialValues(loadId, loadMode)}
                validationSchema={vehicleClassSchema}
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
                                sx={{ gridColumn: "span 4" }}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Vehicle Class"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.vehicleClass}
                                name="vehicleClass"
                                error={!!touched.vehicleClass && !!errors.vehicleClass}
                                helperText={touched.vehicleClass && errors.vehicleClass}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Description"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.description}
                                name="description"
                                error={!!touched.description && !!errors.description}
                                helperText={touched.description && errors.description}
                                sx={{ gridColumn: "span 4" }}
                            />



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

export default VehicleClass;
