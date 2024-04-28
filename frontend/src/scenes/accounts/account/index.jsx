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
import React, {useState} from "react";
import accountSchema from "../../../data/schemas/accountSchema";
import {sendCommand} from "../../../utils/sendCommand";
import {SNIPER_SERVER_URL} from "../../../utils/constants";
import ProgressWheel from "../../../components/ProgressWheel";
import {validateAccountForAddressValidation} from "../../../utils/validators/validateAccountForAddressValidation";
import defaultAccounts, {ensureDefaultAccounts} from "../../../data/defaults/defaultAccounts";
import {isDescriptionUnique} from "../../../utils/utils";

const initialValues = {
    id: undefined,
    description: "",
    privateKey: "",
    address: "",
};

const Account = () => {
    const componentName = 'Account';
    const log = (message) => console.log(`[${componentName}] ${message}`);

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { state } = useLocation();

    const {
        loadId,
        loadMode,
        origin,
        originId,
        mevSettingsOrigin,
    } = (!!state ? state : {});


    const isNonMobile = useMediaQuery("(min-width:600px");
    const navigate = useNavigate();
    const [accounts, setAccounts] = useSessionStorage('accounts', defaultAccounts);
    const [waiting, setWaiting] = useState(false);

    if(!accounts || accounts.length === 0) {
        setAccounts(defaultAccounts);
    }

    ensureDefaultAccounts(accounts, setAccounts);

    const getValuesForId = (id) => {
        try {
            return accounts.filter(o => (
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
            // only 'new' mode is possible when routed from scenes other than 'accounts'
            if(typeof(_loadId) === 'undefined') {
                return initialValues;
            }

            return {
                ...(getValuesForId(loadId) || initialValues),
                id: (_loadMode && _loadMode === 'edit') ? loadId : undefined,
            }
        } catch(e) {
            log(`Error getting initial values`);
            console.log(e);
            return initialValues;
        }
    }

    const _navigate = () => {
        if(origin && ['session', 'autobot'].includes(origin)) {
            navigate(
                '/' + origin,
                {
                    state: {
                        origin: 'settings',
                        loadId: originId,
                    }
                }
            );
        } else if(origin && origin === 'executor') {
            navigate(
                '/executor',
                {
                    state: {
                        origin: 'account',
                        loadId: originId,
                        mevSettingsOrigin,
                    }
                }
            );
        } else {
            navigate('/accounts');
        }
    }

    const handleFormSubmit = (values) => {
        let savedId;

        if(!values) {
            log(`Values undefined - cannot save account`);
            window.alert(`Values undefined - cannot save account`);
            return;
        }

        const {description} = values;

        if(!description) {
            log(`description undefined - cannot save account`);
            window.alert(`description undefined - cannot save account`);
            return;
        }

        const validationResult = validateAccountForAddressValidation(values);

        if(!validationResult.success) {
            log(`Account validation failed: ${validationResult.message}`);
            window.alert(`Account validation failed: ${validationResult.message}`);
            return;
        }

        const accountsClone = accounts.slice();

        try {
            if(typeof(values.id) !== 'undefined') {
                console.log(`params have id ${values.id}`);
                let index = -1;

                for(let i = 0; i < accountsClone.length; i++) {
                    const { id } = accountsClone[i];

                    if(values.id === id) {
                        index = i;
                        break;
                    }
                }

                if(index === -1) {
                    // did not find
                    if(!isDescriptionUnique(description, accountsClone || [])) {
                        log(`description must be unique - already have an entry for:\n\n${description}`);
                        window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                        return;
                    }

                    accountsClone.push({...values});
                } else {
                    accountsClone[index] = {...values};
                }

                setAccounts(accountsClone);
                window.alert(`Account ${values.address} updated at id# ${values.id} with description:\n ${values.description}`);
                _navigate();
            } else {
                let maxId = -1;

                if(!isDescriptionUnique(description, accountsClone || [])) {
                    log(`description must be unique - already have an entry for:\n\n${description}`);
                    window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                    return;
                }

                for(const item of accountsClone) {
                    if(item && typeof(item.id) !== 'undefined') {
                        if(item.id > maxId) {
                            maxId = item.id;
                        }
                    }
                }

                console.log(`Max id is ${maxId}`);
                const nextId = (typeof(maxId) === 'number') ? maxId + 1 : 1;
                console.log(`Next id is ${nextId}`);
                setWaiting(true);

                // TODO - get address /  validate
                // send request to validate account / get address
                sendCommand(SNIPER_SERVER_URL, 'validateAccount', 'async', {
                    privateKey: values.privateKey.trim()
                }, (err, data) => {
                    setWaiting(false);

                    if(err) {
                        // TODO - take no action
                    } else if(!data) {
                        log(`Data undefined in response to request for validating account`);
                        window.alert(`Data undefined in response to request for validating account`);
                    } else {
                        const { success, message, error, address } = data;

                        try {
                            if(!success) {
                                const _message = `Sniper app failed to validate account: ${message}`;
                                log(_message);
                                window.alert(_message);
                            } else if(!address) {
                                const _message = `address undefined in account validation: ${message}`;
                                log(_message);
                                window.alert(_message);
                            } else {
                                log(message);

                                let doesAddressExist = false;
                                let existingAcctId;

                                for(const item of accountsClone) {
                                    if(
                                        item
                                        && item.address
                                        && item.address.toLowerCase() === address.toLowerCase()
                                    ) {
                                        existingAcctId = item.id;
                                        doesAddressExist = true;
                                        break;
                                    }
                                }

                                if(doesAddressExist) {
                                    window.alert(`Failed to add new account - an account already exists at id ${existingAcctId} for address ${address}`);
                                } else {
                                    accountsClone.push({
                                        ...values,
                                        privateKey: values.privateKey.trim(),
                                        id: nextId,
                                        address,
                                    });

                                    // once validated
                                    savedId = nextId;
                                    setAccounts(accountsClone);
                                    window.alert(`New account ${address} validated and saved at id# ${savedId} with description: \n ${values.description}`);
                                    _navigate();
                                }
                            }
                        } catch(e) {
                            log(`Error saving account after validation`);
                            console.log(e);
                            window.alert(`Error saving account after validation: ${e.toString()}`);
                        }
                    }
                });
            }
        } catch(e) {
            log(`Error saving account`);
            console.log(e);
            window.alert(`Error saving account: ${e.toString()}`);
        }
    }

    const handleCancel = (values) => {
        _navigate();
    }

    return(
        <Box m="20px" minHeight="85vh">
            <Header title="ACCOUNT" subtitle="Create / edit account" />

            <Formik
                onSubmit={handleFormSubmit}
                initialValues={getInitialValues(loadId, loadMode)}
                validationSchema={accountSchema}
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
                                label="Account ID"
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
                                label="Please provide a brief description / name for the account"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.description}
                                name="description"
                                error={!!touched.description && !!errors.description}
                                helperText={touched.description && errors.description}
                                sx={{ gridColumn: "span 3" }}
                            />

                            {/*<Typography*/}
                            {/*    variant="h4"*/}
                            {/*    color={colors.greenAccent[400]}*/}
                            {/*    sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}*/}
                            {/*>*/}
                            {/*    Provider URLs*/}
                            {/*</Typography>*/}

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Private Key"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.privateKey}
                                name="privateKey"
                                error={!!touched.privateKey && !!errors.privateKey}
                                helperText={touched.privateKey && errors.privateKey}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                InputProps={{
                                    readOnly: true,
                                }}
                                variant="filled"
                                type="text"
                                label="Account Address"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.address}
                                name="address"
                                error={!!touched.address && !!errors.address}
                                helperText={touched.address && errors.address}
                                sx={{ gridColumn: "span 4" }}
                            />

                        </Box>
                        <Box display="flex" justifyContent="end" mt="10px" p="10px">
                            <Button color="secondary" variant="contained" onClick={() => { handleFormSubmit(values); }}>
                                Save Account
                            </Button>
                            <Button color="secondary" variant="contained" sx={{ml: "5px", mr: "5px"}} onClick={() => { handleCancel(values); }}>
                                Cancel
                            </Button>
                        </Box>
                    </form>
                )}
            </Formik>

            {waiting && (<ProgressWheel />)}
        </Box>
    );
}

export default Account;
