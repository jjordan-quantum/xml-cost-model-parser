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
import featureSchema from "../../../data/schemas/featureSchema";

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

const Feature = () => {
    const componentName = 'Feature';
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
    const [features, setFeatures] = useSessionStorage('features', []);
    const [codeNumbers, setCodeNumbers] = useSessionStorage('codeNumbers', []);
    const [featuresEdits, setFeaturesEdits] = useSessionStorage('featuresEdits', []);
    const [newFeatureEdit, setNewFeatureEdit] = useSessionStorage('newFeatureEdit', undefined);


    const getValuesForId = (id) => {
        try {
            return features.filter(o => (
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
        if(origin && origin !== 'preset') {
            navigate(
                '/' + origin,
                {
                    state: {
                        origin: 'feature',
                        loadId: originId,
                        useGasPriceSettingsId: _id,
                    }
                }
            );
        } else {
            navigate('/features');
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

                for(let i = 0; i < features.length; i++) {
                    const { id } = features[i];

                    if(values.id === id) {
                        index = i;
                        break;
                    }
                }

                if(index === -1) {
                    features.push({...values});
                } else {
                    features[index] = {...values};
                }
            } else {
                let maxId = -1;

                for(const item of features) {
                    if(item && typeof(item.id) !== 'undefined') {
                        if(item.id > maxId) {
                            maxId = item.id;
                        }
                    }
                }

                //console.log(`Max id is ${maxId}`);
                const nextId = (typeof(maxId) === 'number') ? maxId + 1 : 1;
                //console.log(`Next id is ${nextId}`);

                features.push({
                    ...values,
                    id: nextId,
                });

                savedId = nextId;
                values.id = savedId;
            }

            setFeatures(features);
            let useFeatureId;

            if(typeof(values.id) !== 'undefined') {
                useFeatureId = values.id;
                window.alert(`Features updated for preset # ${useFeatureId} with description:\n ${values.description}`);
            } else {
                useFeatureId = savedId;
                window.alert(`Features updated for preset # ${useFeatureId} with description:\n ${values.description}`);
            }

            return useFeatureId;
        } catch(e) {
            log(`Error saving feature`);
            console.log(e);
            window.alert(`Error saving feature: ${e.toString()}`);
            return undefined;
        }
    }

    const handleFormSubmit = (values) => {
        let savedId;

        const useFeatureId = handleSave(values);

        if(typeof(useFeatureId) !== 'undefined') {
            _navigate(useFeatureId);
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
            for(let i = 0; i < featuresEdits.length; i++) {
                if(featuresEdits[i].id === editId) {
                    featuresEdits[i] = {...values};
                    foundEdit = true;
                    break;
                }
            }

            if(!foundEdit) {
                featuresEdits.push({
                    ...values,
                    id: editId,
                });
            }

            setFeaturesEdits(featuresEdits);
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
            setNewFeatureEdit(values);
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
                    origin: 'feature',  // origin - will return here on save
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
                    origin: 'feature',  // origin - will return here on save
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
                    origin: 'feature',  // origin - will return here on save
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

    const handleEditClass = (codeNumber, values) => {
        const {id} = codeNumbers.filter(cls => cls.codeNumber === codeNumber)[0] || {};
        log(`Editing code number: ${id}`);
        handleEditSettings(id, values, '/code-number');
    }

    const handleDuplicateClass = (codeNumber, values) => {
        const {id} = codeNumbers.filter(cls => cls.codeNumber === codeNumber)[0] || {};
        log(`Duplicating code class: ${id}`);
        handleDuplicateSettings(id, values, '/code-number');
    }

    const handleCreateClass = (values) => {
        log(`Creating new code number`);
        handleCreateSettings(values, '/code-number')
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

    const codeNumberOptions = codeNumbers.map((_option) => {
        return {
            value: _option.id,
            label: `${_option.codeCategoryNumber}-${_option.codeSubCategoryNumber}-${_option.codeNumber} - ${_option.codeName}`,
            codeSubCategory: _option.codeSubCategory,
            codeSubCategoryNumber: _option.codeSubCategoryNumber,
            codeCategory: _option.codeCategory,
            codeCategoryNumber: _option.codeCategoryNumber,
            codeName: _option.codeName,
            codeNumber: _option.codeNumber,
            fullCodeNumber: `${_option.codeCategoryNumber}-${_option.codeSubCategoryNumber}-${_option.codeNumber}`,
        }
    });

    return(
        <Box m="20px" minHeight="85vh">
            <Header title="FEATURE" subtitle="Create / edit features" />

            <Formik
                onSubmit={handleFormSubmit}
                initialValues={getInitialValues(loadId, loadMode)}
                validationSchema={featureSchema}
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
                                label="Feature Type"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.featureType}
                                name="featureType"
                                error={!!touched.featureType && !!errors.featureType}
                                helperText={touched.featureType && errors.featureType}
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
                                Feature Code
                            </Typography>

                            <FormControl sx={{
                                gridColumn: "span 2"
                            }}>
                                <Select
                                    options={codeNumberOptions}
                                    name="codeName"
                                    value={(codeNumberOptions ? codeNumberOptions.find(option => option.codeName === values.codeName) : '')}
                                    onChange={(option) => {
                                        setFieldValue( 'codeCategory', option.codeCategory, false  );
                                        setFieldValue( 'codeCategoryNumber', option.codeCategoryNumber, false  );
                                        setFieldValue( 'codeSubCategory', option.codeSubCategory, false  );
                                        setFieldValue( 'codeSubCategoryNumber', option.codeSubCategoryNumber, false  );
                                        setFieldValue( 'codeName', option.codeName, false  );
                                        setFieldValue( 'codeNumber', option.codeNumber, false  );
                                        setFieldValue( 'featureCode', option.fullCodeNumber, false  );
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
                                    <Button color="secondary" variant="contained" onClick={() => { handleEditClass(values.codeName, values) }}>
                                        EDIT
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleDuplicateClass(values.codeName, values) }}>
                                        COPY
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleCreateClass(values) }}>
                                        NEW
                                    </Button>
                                </Box>
                            </Box>

                            {/*<TextField*/}
                            {/*    fullWidth*/}
                            {/*    variant="filled"*/}
                            {/*    type="text"*/}
                            {/*    label="Feature Code"*/}
                            {/*    onBlur={handleBlur}*/}
                            {/*    onChange={handleChange}*/}
                            {/*    value={values.featureCode}*/}
                            {/*    name="featureCode"*/}
                            {/*    error={!!touched.featureCode && !!errors.featureCode}*/}
                            {/*    helperText={touched.featureCode && errors.featureCode}*/}
                            {/*    sx={{ gridColumn: "span 4" }}*/}
                            {/*/>*/}

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Production Quantity"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.productionQuantity}
                                name="productionQuantity"
                                error={!!touched.productionQuantity && !!errors.productionQuantity}
                                helperText={touched.productionQuantity && errors.productionQuantity}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Production Quantity Units"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.productionQuantityUnits}
                                name="productionQuantityUnits"
                                error={!!touched.productionQuantityUnits && !!errors.productionQuantityUnits}
                                helperText={touched.productionQuantityUnits && errors.productionQuantityUnits}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Production Rate"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.productionRate}
                                name="productionRate"
                                error={!!touched.productionRate && !!errors.productionRate}
                                helperText={touched.productionRate && errors.productionRate}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Production Rate Units"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.productionRateUnits}
                                name="productionRateUnits"
                                error={!!touched.productionRateUnits && !!errors.productionRateUnits}
                                helperText={touched.productionRateUnits && errors.productionRateUnits}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Production Duration Per Unit"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.productionDurationPerUnit}
                                name="productionDurationPerUnit"
                                error={!!touched.productionDurationPerUnit && !!errors.productionDurationPerUnit}
                                helperText={touched.productionDurationPerUnit && errors.productionDurationPerUnit}
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

export default Feature;
