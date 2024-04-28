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
import {stringify} from "../../../utils/utils";
import aggregateClassSchema from "../../../data/schemas/aggregateClassSchema";
import Select from "react-select";

const initialValues = {
    id: undefined,
    aggregateClass: "",
    description: "",
};

const Aggregate = () => {
    const componentName = 'Aggregate';
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
    const [aggregateClasses, setAggregateClasses] = useSessionStorage('aggregateClasses', []);
    const [aggregateTypes, setAggregateTypes] = useSessionStorage('aggregateTypes', []);
    const [aggregateEdits, setAggregateEdits] = useSessionStorage('aggregateEdits', []);
    const [newAggregrateEdit, setNewAggregateEdit] = useSessionStorage('newAggregrateEdit', undefined);

    const getValuesForId = (id) => {
        try {
            return aggregateClasses.filter(o => (
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
            navigate('/aggregate-classes');
        }
    }

    const handleSave = (values) => {
        let savedId;

        if(!values) {
            log(`Values undefined - cannot save settings`);
            window.alert(`Values undefined - cannot save settings`);
            return;
        }

        const {description, aggregateClass} = values;

        if(!description) {
            log(`description undefined - cannot save settings`);
            window.alert(`description undefined - cannot save settings`);
            return;
        }

        if(!aggregateClass) {
            log(`aggregateClass undefined - cannot save settings`);
            window.alert(`aggregateClass undefined - cannot save settings`);
            return;
        }


        //const {success, message} = validateGasPriceSettings(values);

        // TODO - validate aggregate type
        try {
            if(typeof(values.id) !== 'undefined') {
                //console.log(`params have id ${values.id}`);
                let index = -1;

                for(let i = 0; i < aggregateClasses.length; i++) {
                    const { id } = aggregateClasses[i];

                    if(values.id === id) {
                        index = i;
                        break;
                    }
                }

                if(index === -1) {
                    if((aggregateClasses || []).map((p) => p.aggregateClass.toLowerCase()).includes(aggregateClass.toLowerCase())) {
                        log(`aggregateClass must be unique - already have an entry for:\n\n${aggregateClass}`);
                        window.alert(`aggregateClass must be unique - already have an entry for:\n\n${aggregateClass}`);
                        return;
                    }

                    aggregateClasses.push({...values});
                } else {
                    aggregateClasses[index] = {...values};
                }
            } else {
                let maxId = -1;

                if((aggregateClasses || []).map((p) => p.aggregateClass.toLowerCase()).includes(aggregateClass.toLowerCase())) {
                    log(`aggregateClass must be unique - already have an entry for:\n\n${aggregateClass}`);
                    window.alert(`aggregateClass must be unique - already have an entry for:\n\n${aggregateClass}`);
                    return;
                }

                for(const item of aggregateClasses) {
                    if(item && typeof(item.id) !== 'undefined') {
                        if(item.id > maxId) {
                            maxId = item.id;
                        }
                    }
                }

                //console.log(`Max id is ${maxId}`);
                const nextId = (typeof(maxId) === 'number') ? maxId + 1 : 1;
                //console.log(`Next id is ${nextId}`);

                aggregateClasses.push({
                    ...values,
                    id: nextId,
                });

                savedId = nextId;
                values.id = savedId;
            }

            setAggregateClasses(aggregateClasses);
            let useAggregateClassId;

            if(typeof(values.id) !== 'undefined') {
                useAggregateClassId = values.id;
                window.alert(`Aggregate Classes updated for preset # ${useAggregateClassId} with description:\n ${values.description} and class ${aggregateClass}`);
            } else {
                useAggregateClassId = savedId;
                window.alert(`Aggregate Classes updated for preset # ${useAggregateClassId} with description:\n ${values.description} and class ${aggregateClass}`);
            }

            return useAggregateClassId;
        } catch(e) {
            log(`Error saving aggregate class`);
            console.log(e);
            window.alert(`Error saving aggregate class: ${e.toString()}`);
            return undefined;
        }
    }

    const handleFormSubmit = (values) => {
        let savedId;

        const useAggregateClassId = handleSave(values);

        if(typeof(useAggregateClassId) !== 'undefined') {
            _navigate(useAggregateClassId);
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
        let foundEdit = false;

        try {
            for(let i = 0; i < aggregateEdits.length; i++) {
                if(aggregateEdits[i].id === editId) {
                    aggregateEdits[i] = {...values};
                    foundEdit = true;
                    break;
                }
            }

            if(!foundEdit) {
                aggregateEdits.push({
                    ...values,
                    id: editId,
                });
            }

            setAggregateEdits(aggregateEdits);
        } catch(e) {
            log(`Error updating edit for id`);
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
            setNewAggregateEdit(values);
        }
    }

    // =================================================================================================================
    //
    //  edit settings handlers
    //
    // =================================================================================================================

    const handleEditSettings = (id, values, route) => {
        if(typeof(id) === 'undefined') {
            log('id undefined - nothing to edit');
            return;
        }

        log(`Saving edit`);
        saveEdit(values);
        log(`Editing settings for ${route}`);

        navigate(
            route,
            {
                state: {
                    loadId: id,  // id of settings to be loaded in edit view
                    loadMode: 'edit',  // mode - indicating to edit existing settings
                    origin: 'aggregate',  // origin - will return here on save
                    originId: values.id  // session id to load, upon return, otherwise load from newEdit storage
                }
            }
        );
    }

    const handleDuplicateSettings = (id, values, route) => {
        if(typeof(id) === 'undefined') {
            log('id undefined - nothing to duplicate');
            return;
        }

        log(`Saving edit`);
        saveEdit(values);
        log(`Copying settings for ${route}`);

        navigate(
            route,
            {
                state: {
                    loadId: id,  // id of settings to be loaded in edit view
                    loadMode: 'duplicate',  // mode - indicating to edit existing settings
                    origin: 'aggregate',  // origin - will return here on save
                    originId: values.id  // session id to load, upon return, otherwise load from newEdit storage
                }
            }
        );
    }

    const handleCreateSettings = (values, route) => {
        saveEdit(values);
        log(`Creating new settings for ${route}`);

        navigate(
            route,
            {
                state: {
                    loadMode: 'new',  // mode - indicating to edit existing settings
                    origin: 'aggregate',  // origin - will return here on save
                    originId: values.id  // session id to load, upon return, otherwise load from newEdit storage
                }
            }
        );
    }

    // =================================================================================================================
    //
    //  class edit actions handlers
    //
    // =================================================================================================================

    const handleEditClass = (aggregateType, values) => {
        const {id} = aggregateTypes.filter(cls => cls.aggregateType === aggregateType)[0] || {};
        log(`Editing aggregate type: ${id}`);
        handleEditSettings(id, values, '/aggregate-type');
    }

    const handleDuplicateClass = (aggregateType, values) => {
        const {id} = aggregateTypes.filter(cls => cls.aggregateType === aggregateType)[0] || {};
        log(`Duplicating aggregate type: ${id}`);
        handleDuplicateSettings(id, values, '/aggregate-type');
    }

    const handleCreateClass = (values) => {
        log(`Creating new aggregate type`);
        handleCreateSettings(values, '/aggregate-type')
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

    const aggregateTypeOptions = aggregateTypes.map((_option) => {
        return {
            value: _option.id,
            label: _option.aggregateType,
        }
    });

    return(
        <Box m="20px" minHeight="85vh">
            <Header title="AGGREGATE CLASS" subtitle="Create / edit aggregate classes" />

            <Formik
                onSubmit={handleFormSubmit}
                initialValues={getInitialValues(loadId, loadMode)}
                validationSchema={aggregateClassSchema}
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
                                label="Aggregate"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.aggregate}
                                name="aggregate"
                                error={!!touched.aggregate && !!errors.aggregate}
                                helperText={touched.aggregate && errors.aggregate}
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

                            <Typography
                                variant="h5"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 1" }}
                            >
                                Aggregate Type
                            </Typography>

                            <FormControl sx={{
                                gridColumn: "span 2"
                            }}>
                                <Select
                                    options={aggregateTypeOptions}
                                    name="aggregateType"
                                    value={(aggregateTypeOptions ? aggregateTypeOptions.find(option => option.label === values.aggregateType) : '')}
                                    onChange={(option) => {
                                        setFieldValue( 'aggregateType', option.label, false  );
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
                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleEditClass(values.aggregateType, values) }}>
                                        EDIT
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleDuplicateClass(values.aggregateType, values) }}>
                                        COPY
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleCreateClass(values) }}>
                                        NEW
                                    </Button>
                                </Box>
                            </Box>

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Quantity"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.quantity}
                                name="quantity"
                                error={!!touched.quantity && !!errors.quantity}
                                helperText={touched.quantity && errors.quantity}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Units"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.units}
                                name="units"
                                error={!!touched.units && !!errors.units}
                                helperText={touched.units && errors.units}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Conversion Factor"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.conversionFactor}
                                name="conversionFactor"
                                error={!!touched.conversionFactor && !!errors.conversionFactor}
                                helperText={touched.conversionFactor && errors.conversionFactor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Conversion Factor Units"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.conversionFactorUnits}
                                name="conversionFactorUnits"
                                error={!!touched.conversionFactorUnits && !!errors.conversionFactorUnits}
                                helperText={touched.conversionFactorUnits && errors.conversionFactorUnits}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Final Units"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.finalUnits}
                                name="finalUnits"
                                error={!!touched.finalUnits && !!errors.finalUnits}
                                helperText={touched.finalUnits && errors.finalUnits}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Rate"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.rate}
                                name="rate"
                                error={!!touched.rate && !!errors.rate}
                                helperText={touched.rate && errors.rate}
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

export default Aggregate;
