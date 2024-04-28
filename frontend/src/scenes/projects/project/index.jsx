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
import vehicleTypeSchema from "../../../data/schemas/vehicleTypeSchema";
import projectSchema from "../../../data/schemas/projectSchema";

const initialValues = {
    id: undefined,
    projectNumber: "",
    projectName: "",
    projectLocation: "",
    closingDate: "",
    closingTime: "",
    owner: "",
    blank: "",
};

const Project = () => {
    const componentName = 'Project';
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
    const [projects, setProjects] = useSessionStorage('projects', []);
    const [projectEdits, setProjectEdits] = useSessionStorage('projectEdits', []);
    const [newProjectTypeEdit, setNewProjectTypeEdit] = useSessionStorage('newProjectTypeEdit', undefined);

    const getValuesForId = (id) => {
        try {
            return projects.filter(o => (
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
        // if(origin) {
        //     navigate(
        //         '/' + origin,
        //         {
        //             state: {
        //                 origin: 'settings',
        //                 loadId: originId,
        //                 useGasPriceSettingsId: _id,
        //             }
        //         }
        //     );
        // } else {
        //     navigate('/projects');
        // }
        navigate('/projects');
    }

    const handleSave = (values) => {
        let savedId;

        if(!values) {
            log(`Values undefined - cannot save settings`);
            window.alert(`Values undefined - cannot save settings`);
            return;
        }

        const {projectNumber, projectName} = values;

        if(!projectNumber) {
            log(`projectNumber undefined - cannot save settings`);
            window.alert(`projectNumber undefined - cannot save settings`);
            return;
        }

        if(!projectName) {
            log(`projectName undefined - cannot save settings`);
            window.alert(`projectName undefined - cannot save settings`);
            return;
        }

        //const {success, message} = validateGasPriceSettings(values);

        // TODO - validate vehicle type
        try {
            if(typeof(values.id) !== 'undefined') {
                //console.log(`params have id ${values.id}`);
                let index = -1;

                for(let i = 0; i < projects.length; i++) {
                    const { id } = projects[i];

                    if(values.id === id) {
                        index = i;
                        break;
                    }
                }

                if(index === -1) {
                    if((projects || []).map((p) => p.projectNumber.toLowerCase()).includes(projectNumber.toLowerCase())) {
                        log(`projectNumber must be unique - already have an entry for:\n\n${projectNumber}`);
                        window.alert(`projectNumber must be unique - already have an entry for:\n\n${projectNumber}`);
                        return;
                    }

                    projects.push({...values});
                } else {
                    projects[index] = {...values};
                }
            } else {
                let maxId = -1;

                if((projects || []).map((p) => p.projectNumber.toLowerCase()).includes(projectNumber.toLowerCase())) {
                    log(`projectNumber must be unique - already have an entry for:\n\n${projectNumber}`);
                    window.alert(`projectNumber must be unique - already have an entry for:\n\n${projectNumber}`);
                    return;
                }

                for(const item of projects) {
                    if(item && typeof(item.id) !== 'undefined') {
                        if(item.id > maxId) {
                            maxId = item.id;
                        }
                    }
                }

                //console.log(`Max id is ${maxId}`);
                const nextId = (typeof(maxId) === 'number') ? maxId + 1 : 1;
                //console.log(`Next id is ${nextId}`);

                projects.push({
                    ...values,
                    id: nextId,
                });

                savedId = nextId;
                values.id = savedId;
            }

            setProjects(projects);
            let useProjectId;

            if(typeof(values.id) !== 'undefined') {
                useProjectId = values.id;
                window.alert(`Projects updated for preset # ${useProjectId} with name:\n ${values.projectName} and number ${projectNumber}`);
            } else {
                useProjectId = savedId;
                window.alert(`Projects updated for preset # ${useProjectId} with name:\n ${values.projectName} and number ${projectNumber}`);
            }

            return useProjectId;
        } catch(e) {
            log(`Error saving project`);
            console.log(e);
            window.alert(`Error saving project: ${e.toString()}`);
            return undefined;
        }
    }

    const handleFormSubmit = (values) => {
        let savedId;

        const useProjectId = handleSave(values);

        if(typeof(useProjectId) !== 'undefined') {
            _navigate(useProjectId);
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
        //     for(let i = 0; i < vehicleClassEdits.length; i++) {
        //         if(vehicleClassEdits[i].id === editId) {
        //             vehicleClassEdits[i] = {...values};
        //             foundEdit = true;
        //             break;
        //         }
        //     }
        //
        //     if(!foundEdit) {
        //         vehicleClassEdits.push({
        //             ...values,
        //             id: editId,
        //         });
        //     }
        //
        //     setVehicleClassEdits(vehicleClassEdits);
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
        //     setNewVehicleClassEdit(values);
        // }
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
                    origin: 'project',  // origin - will return here on save
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
                    origin: 'project',  // origin - will return here on save
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
                    origin: 'project',  // origin - will return here on save
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

    const handleEditClass = (projectNumber, values) => {
        const {id} = projects.filter(cls => cls.projectNumber === projectNumber)[0] || {};
        log(`Editing project class: ${id}`);
        handleEditSettings(id, values, '/project');
    }

    const handleDuplicateClass = (projectNumber, values) => {
        const {id} = projects.filter(cls => cls.projectNumber === projectNumber)[0] || {};
        log(`Duplicating project class: ${id}`);
        handleDuplicateSettings(id, values, '/project');
    }

    const handleCreateClass = (values) => {
        log(`Creating new project class`);
        handleCreateSettings(values, '/project')
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

    // const vehicleClassOptions = vehicleClasses.map((_option) => {
    //     return {
    //         value: _option.id,
    //         label: _option.vehicleClass,
    //     }
    // });

    return(
        <Box m="20px" minHeight="85vh">
            <Header title="VEHICLE TYPE" subtitle="Create / edit vehicle types" />

            <Formik
                onSubmit={handleFormSubmit}
                initialValues={getInitialValues(loadId, loadMode)}
                validationSchema={projectSchema}
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
                                label="Project Number"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.projectNumber}
                                name="projectNumber"
                                error={!!touched.projectNumber && !!errors.projectNumber}
                                helperText={touched.projectNumber && errors.projectNumber}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Project Name"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.projectName}
                                name="projectName"
                                error={!!touched.projectName && !!errors.projectName}
                                helperText={touched.projectName && errors.projectName}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Project Location"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.projectLocation}
                                name="projectLocation"
                                error={!!touched.projectLocation && !!errors.projectLocation}
                                helperText={touched.projectLocation && errors.projectLocation}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Closing Date"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.closingDate}
                                name="closingDate"
                                error={!!touched.closingDate && !!errors.closingDate}
                                helperText={touched.closingDate && errors.closingDate}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Closing Time"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.closingTime}
                                name="closingTime"
                                error={!!touched.closingTime && !!errors.closingTime}
                                helperText={touched.closingTime && errors.closingTime}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Owner"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.owner}
                                name="owner"
                                error={!!touched.owner && !!errors.owner}
                                helperText={touched.owner && errors.owner}
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

export default Project;
