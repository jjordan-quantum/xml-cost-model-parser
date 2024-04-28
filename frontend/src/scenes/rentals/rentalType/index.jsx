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
import aggregateTypeSchema from "../../../data/schemas/aggregateTypeSchema";
import bidItemSchema from "../../../data/schemas/bidItemSchema";
import project from "../../projects/project";
import activitySchema from "../../../data/schemas/activitySchema";
import crewSchema from "../../../data/schemas/crewSchema";
import rentalSchema from "../../../data/schemas/rentalSchema";
import rentalTypeSchema from "../../../data/schemas/rentalTypeSchema";

const initialValues = {
    id: undefined,
    activityType: "",
    description: "",
    activityCode: "",
    productionQuantity: "",
    productionQuantityUnits: "",
    productionRate: "",
    productionRateUnits: "",
    productionDurationPerUnit: "",
};

const RentalType = () => {
    const componentName = 'RentalType';
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
    const [rentalTypes, setRentalTypes] = useSessionStorage('rentalTypes', []);

    const getValuesForId = (id) => {
        try {
            return rentalTypes.filter(o => (
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
            navigate('/rental-types');
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

        //const {success, message} = validateGasPriceSettings(values);

        // TODO - validate aggregate type
        try {
            if(typeof(values.id) !== 'undefined') {
                //console.log(`params have id ${values.id}`);
                let index = -1;

                for(let i = 0; i < rentalTypes.length; i++) {
                    const { id } = rentalTypes[i];

                    if(values.id === id) {
                        index = i;
                        break;
                    }
                }

                if(index === -1) {
                    rentalTypes.push({...values});
                } else {
                    rentalTypes[index] = {...values};
                }
            } else {
                let maxId = -1;

                for(const item of rentalTypes) {
                    if(item && typeof(item.id) !== 'undefined') {
                        if(item.id > maxId) {
                            maxId = item.id;
                        }
                    }
                }

                //console.log(`Max id is ${maxId}`);
                const nextId = (typeof(maxId) === 'number') ? maxId + 1 : 1;
                //console.log(`Next id is ${nextId}`);

                rentalTypes.push({
                    ...values,
                    id: nextId,
                });

                savedId = nextId;
                values.id = savedId;
            }

            setRentalTypes(rentalTypes);
            let useRentalTypeId;

            if(typeof(values.id) !== 'undefined') {
                useRentalTypeId = values.id;
                window.alert(`Rental Types updated for preset # ${useRentalTypeId} with description:\n ${values.description}`);
            } else {
                useRentalTypeId = savedId;
                window.alert(`Rental Types updated for preset # ${useRentalTypeId} with description:\n ${values.description}`);
            }

            return useRentalTypeId;
        } catch(e) {
            log(`Error saving rental type`);
            console.log(e);
            window.alert(`Error saving rental type: ${e.toString()}`);
            return undefined;
        }
    }

    const handleFormSubmit = (values) => {
        let savedId;

        const useRentalTypeId = handleSave(values);

        if(typeof(useRentalTypeId) !== 'undefined') {
            _navigate(useRentalTypeId);
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
    //  managing edits
    //
    // =================================================================================================================

    const updateEditForId = (editId, values) => {
        // let foundEdit = false;
        //
        // try {
        //     for(let i = 0; i < aggregateClassEdits.length; i++) {
        //         if(aggregateClassEdits[i].id === editId) {
        //             aggregateClassEdits[i] = {...values};
        //             foundEdit = true;
        //             break;
        //         }
        //     }
        //
        //     if(!foundEdit) {
        //         aggregateClassEdits.push({
        //             ...values,
        //             id: editId,
        //         });
        //     }
        //
        //     setAggregateClassEdits(aggregateClassEdits);
        // } catch(e) {
        //     log(`Error updating edit for id`);
        //     console.log(e);
        //     return undefined;
        // }
    }

    const saveEdit = (values) => {
        // // save edit
        // if(typeof(values.id) !== 'undefined') {
        //     // pre-existing snipe session -> update edit for existing
        //     updateEditForId(values.id, values);
        // } else {
        //     // new snipe session -> update edit for new
        //     setNewAggregateClassEdit(values);
        // }
    }

    // =================================================================================================================
    //
    //  edit settings handlers
    //
    // =================================================================================================================

    const handleEditSettings = (id, values, route) => {
        // if(typeof(id) === 'undefined') {
        //     log('id undefined - nothing to edit');
        //     return;
        // }
        //
        // log(`Saving edit`);
        // saveEdit(values);
        // log(`Editing settings for ${route}`);
        //
        // navigate(
        //     route,
        //     {
        //         state: {
        //             loadId: id,  // id of settings to be loaded in edit view
        //             loadMode: 'edit',  // mode - indicating to edit existing settings
        //             origin: 'aggregate-type',  // origin - will return here on save
        //             originId: values.id  // session id to load, upon return, otherwise load from newEdit storage
        //         }
        //     }
        // );
    }

    const handleDuplicateSettings = (id, values, route) => {
        // if(typeof(id) === 'undefined') {
        //     log('id undefined - nothing to duplicate');
        //     return;
        // }
        //
        // log(`Saving edit`);
        // saveEdit(values);
        // log(`Copying settings for ${route}`);
        //
        // navigate(
        //     route,
        //     {
        //         state: {
        //             loadId: id,  // id of settings to be loaded in edit view
        //             loadMode: 'duplicate',  // mode - indicating to edit existing settings
        //             origin: 'aggregate-type',  // origin - will return here on save
        //             originId: values.id  // session id to load, upon return, otherwise load from newEdit storage
        //         }
        //     }
        // );
    }

    const handleCreateSettings = (values, route) => {
        // saveEdit(values);
        // log(`Creating new settings for ${route}`);
        //
        // navigate(
        //     route,
        //     {
        //         state: {
        //             loadMode: 'new',  // mode - indicating to edit existing settings
        //             origin: 'aggregate-type',  // origin - will return here on save
        //             originId: values.id  // session id to load, upon return, otherwise load from newEdit storage
        //         }
        //     }
        // );
    }

    // =================================================================================================================
    //
    //  class edit actions handlers
    //
    // =================================================================================================================

    const handleEditClass = (aggregateClass, values) => {
        // const {id} = aggregateClasses.filter(cls => cls.aggregateClass === aggregateClass)[0] || {};
        // log(`Editing aggregate class: ${id}`);
        // handleEditSettings(id, values, '/aggregate-class');
    }

    const handleDuplicateClass = (aggregateClass, values) => {
        // const {id} = aggregateClasses.filter(cls => cls.aggregateClass === aggregateClass)[0] || {};
        // log(`Duplicating aggregate class: ${id}`);
        // handleDuplicateSettings(id, values, '/aggregate-class');
    }

    const handleCreateClass = (values) => {
        // log(`Creating new aggregate class`);
        // handleCreateSettings(values, '/aggregate-class')
    }

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

    // const projectOptions = projects.map((_option) => {
    //     return {
    //         value: _option.projectNumber,
    //         label: `${_option.projectNumber} - ${_option.projectName}`,
    //     }
    // });

    return(
        <Box m="20px" minHeight="85vh">
            <Header title="RENTAL" subtitle="Create / edit rentals" />

            <Formik
                onSubmit={handleFormSubmit}
                initialValues={getInitialValues(loadId, loadMode)}
                validationSchema={rentalTypeSchema}
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
                                label="Rental Type"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.rentalType}
                                name="rentalType"
                                error={!!touched.rentalType && !!errors.rentalType}
                                helperText={touched.rentalType && errors.rentalType}
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
                            {/*    label="Aggregate Class"*/}
                            {/*    onBlur={handleBlur}*/}
                            {/*    onChange={handleChange}*/}
                            {/*    value={values.aggregateClass}*/}
                            {/*    name="aggregateClass"*/}
                            {/*    error={!!touched.aggregateClass && !!errors.aggregateClass}*/}
                            {/*    helperText={touched.aggregateClass && errors.aggregateClass}*/}
                            {/*    sx={{ gridColumn: "span 4" }}*/}
                            {/*/>*/}




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

export default RentalType;
