import {
    Box,
    Button, CircularProgress,
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
import React, {useEffect, useState} from "react";
import Select, { Option, ReactSelectProps } from 'react-select'
import snipeSessionSchema from "../../../data/schemas/snipeSessionSchema";
import {getRandomInt, isDescriptionUnique} from "../../../utils/utils";
import {DataGrid, useGridApiContext, useGridApiRef} from "@mui/x-data-grid";
import {getStatus, getStatusWithoutAlert} from "../../../utils/getStatus";
import {SNIPER_SERVER_URL} from "../../../utils/constants";
import {sendCommand, sendCommandWithPromise} from "../../../utils/sendCommand";
import ProgressWheel from "../../../components/ProgressWheel";
import {validateSnipeSessionValues} from "../../../utils/validators/validateSnipeSessionValues";
import defaultAccounts, {ensureDefaultAccounts} from "../../../data/defaults/defaultAccounts";
import {ensureDefaultSwapParams} from "../../../data/defaults/defaultSwapParamsPresets";
import AccountsUpdater from "../../../components/AccountsUpdater";

const initialValues = {
    id: undefined,
    description: "",

    tokenContractAddress: "",
    tokenContractName: "",

    gasPriceSettingsId: undefined,
    mevSettingsId: undefined,
    sellTriggerConditionsId: undefined,
    snipeTriggerConditionsId: undefined,
    swapParamsId: undefined,

    // accounts
    swarmAccountIds: [],
    mevAcctId: undefined,
    mevAcct2Id: undefined,
    wallet2Id: undefined,
};

const SnipeSession = () => {
    const componentName = 'SnipeSession';
    const log = (message) => console.log(`[${componentName}] ${message}`);
    const componentId = getRandomInt();

    // =================================================================================================================
    //
    //  set up theme
    //
    // =================================================================================================================

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const apiRef = useGridApiRef();

    // =================================================================================================================
    //
    //  set up / initialize state
    //
    // =================================================================================================================

    const { state } = useLocation();

    const {
        origin,
        loadId,
        loadMode,
        useValues,  // values to load with (top priority)
        useEditForExisting, // boolean -> should use edit for initial values, for existing snipe session
        useEditForNew, // boolean -> should use edit for initial values for new snipe session

        useGasPriceSettingsId, // gas price settings id value to use (came back from editing connection)
        useMevSettingsId, // mev settings id value to use (came back from editing connection)
        useSellTriggerConditionsId, // sell trigger settings id value to use (came back from editing connection)
        useSnipeTriggerConditionsId, // snipe trigger settings id value to use (came back from editing connection)
        useSwapParamsId, // swap params settings id value to use (came back from editing connection)
        useSecondTriggerWalletSettingsId, // second trigger wallet settings id value to use (came back from editing connection)
    } = (!!state ? state : {});

    const isNonMobile = useMediaQuery("(min-width:600px");
    const navigate = useNavigate();
    const [snipeSessionSettings, setSnipeSessionSettings] = useSessionStorage('snipeSessionSettings', []);
    const [snipeSessionEdits, setSnipeSessionEdits] = useSessionStorage('snipeSessionEdits', []);
    const [newSnipeSessionEdit, setNewSnipeSessionEdit] = useSessionStorage('newSnipeSessionEdit', undefined);

    // settings storage
    const [gasPriceSettings, setGasPriceSettings] = useSessionStorage('gasPriceSettings', []);
    const [mevSettings, setMevSettings] = useSessionStorage('mevSettings', []);
    const [sellTriggerConditions, setSellTriggerConditions] = useSessionStorage('sellTriggerConditions', []);
    const [snipeTriggerConditions, setSnipeTriggerConditions] = useSessionStorage('snipeTriggerConditions', []);
    const [swapParams, setSwapParams] = useSessionStorage('swapParams', []);
    const [secondTriggerWalletSettings, setSecondTriggerWalletSettings] = useSessionStorage('secondTriggerWalletSettings', []);
    const [accounts, setAccounts] = useSessionStorage('accounts', defaultAccounts);

    //const [rows, setRows] = useState(accounts || []);

    const [sessionSaved, setSessionSaved] = useState(false);
    const [savedSessionId, setSavedSessionId] = useState(-1);

    const [waiting, setWaiting] = useState(false);
    const [count, setCount] = useState(0);

    let useAccounts = true;
    let loggedError = true;
    let intervalCounter = 0;

    const [settingsValidated, setSettingsValidated] = useState(false);

    function forceRerender() {
        setCount(count);
    }

    if(!accounts || accounts.length === 0) {
        setAccounts(defaultAccounts);
    }

    ensureDefaultAccounts(accounts, setAccounts);
    ensureDefaultSwapParams(swapParams, setSwapParams);

    log(`Loading snipe session from origin ${origin} with loadId ${loadId} and mode ${loadMode}`);

    let selectedAccounts = [];

    const updateSelectedAccounts = (ids) => {
        log(`Updating selected accounts to:`);
        console.log(ids);
        selectedAccounts = !!ids ? ids.slice() : [];
        setSettingsValidated(false);
    }

    const getValuesForId = (id) => {
        try {
            return snipeSessionSettings.filter(o => (
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
            return snipeSessionEdits.filter(o => (
                o
                && typeof(o.id) !== 'undefined'
                && (o.id === id)
            ))[0];
        } catch(e) {
            log(`Error getting edits for id`);
            console.log(e);
            return undefined;
        }
    }

    const getGasPriceSettingsForId = (id) => {
        try {
            return gasPriceSettings.filter(o => (
                o
                && typeof(o.id) !== 'undefined'
                && (o.id === id)
            ))[0];
        } catch(e) {
            log(`Error getting gas price settings for id`);
            console.log(e);
            return undefined;
        }
    }

    const getSwapParamsForId = (id) => {
        try {
            return swapParams.filter(o => (
                o
                && typeof(o.id) !== 'undefined'
                && (o.id === id)
            ))[0];
        } catch(e) {
            log(`Error getting swap params for id`);
            console.log(e);
            return undefined;
        }
    }

    const getMevSettingsForId = (id) => {
        try {
            return mevSettings.filter(o => (
                o
                && typeof(o.id) !== 'undefined'
                && (o.id === id)
            ))[0];
        } catch(e) {
            log(`Error getting MEV settings for id`);
            console.log(e);
            return undefined;
        }
    }

    const getSnipeTriggerConditionsForId = (id) => {
        try {
            return snipeTriggerConditions.filter(o => (
                o
                && typeof(o.id) !== 'undefined'
                && (o.id === id)
            ))[0];
        } catch(e) {
            log(`Error getting snipe trigger conditions for id`);
            console.log(e);
            return undefined;
        }
    }

    const getSellTriggerConditionsForId = (id) => {
        try {
            return sellTriggerConditions.filter(o => (
                o
                && typeof(o.id) !== 'undefined'
                && (o.id === id)
            ))[0];
        } catch(e) {
            log(`Error getting sell trigger conditions for id`);
            console.log(e);
            return undefined;
        }
    }

    const getSecondTriggerWalletSettingsForId = (id) => {
        try {
            return secondTriggerWalletSettings.filter(o => (
                o
                && typeof(o.id) !== 'undefined'
                && (o.id === id)
            ))[0];
        } catch(e) {
            log(`Error getting second trigger wallet settings for id`);
            console.log(e);
            return undefined;
        }
    }

    const updateEditForId = (editId, values) => {
        let foundEdit = false;

        try {
            for(let i = 0; i < snipeSessionEdits.length; i++) {
                if(snipeSessionEdits[i].id === editId) {
                    snipeSessionEdits[i] = {...values};
                    foundEdit = true;
                    break;
                }
            }

            if(!foundEdit) {
                snipeSessionEdits.push({
                    ...values,
                    id: editId,
                });
            }

            setSnipeSessionEdits(snipeSessionEdits);
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
            setNewSnipeSessionEdit(values);
        }
    }

    // =================================================================================================================
    //
    //  set up / initialize values
    //
    // =================================================================================================================

    let _initialValues = initialValues;

    try {
        if(useValues) {
            log(`Using values from routed state`);
            _initialValues = {...useValues};
        } else if(origin && origin === 'sessions') {
            log('Origin is sessions')
            // opening snipe session from list view, could be new or an edit
            if(typeof(loadId) === 'undefined') {
                log('loadId is undefined - using initial values');
                // this is a new entry
                _initialValues = initialValues;
            } else {
                log(`Loading id ${loadId}`);

                // this is opening an existing entry
                _initialValues = {
                    ...(getValuesForId(loadId) || initialValues),
                    id: (loadMode && loadMode === 'edit') ? loadId : undefined,  // wipe id if it's a copy
                }
            }
        } else if(origin && origin === 'settings') {
            log(`Origin is settings`);

            // returning to snipe session from editing settings
            if(typeof(loadId) === 'undefined') {
                log('loadId is undefined - checking for edit');
                // snipe session is new and does not yet have an id
                // resolve values for new edit - fall back to initial values
                const editValues = {...(newSnipeSessionEdit || initialValues)};

                // snipe session is new - use given settings id's if provided
                _initialValues = {
                    ...editValues,
                    gasPriceSettingsId: (typeof(useGasPriceSettingsId) !== 'undefined') ? useGasPriceSettingsId : editValues.gasPriceSettingsId,
                    mevSettingsId: (typeof(useMevSettingsId) !== 'undefined') ? useMevSettingsId : editValues.mevSettingsId,
                    sellTriggerConditionsId: (typeof(useSellTriggerConditionsId) !== 'undefined') ? useSellTriggerConditionsId : editValues.sellTriggerConditionsId,
                    snipeTriggerConditionsId: (typeof(useSnipeTriggerConditionsId) !== 'undefined') ? useSnipeTriggerConditionsId : editValues.snipeTriggerConditionsId,
                    swapParamsId: (typeof(useSwapParamsId) !== 'undefined') ? useSwapParamsId : editValues.swapParamsId,
                    secondTriggerWalletSettingsId: (typeof(useSecondTriggerWalletSettingsId) !== 'undefined') ? useSecondTriggerWalletSettingsId : editValues.secondTriggerWalletSettingsId,
                }
            } else {
                log(`Loading id ${loadId} from edits`);
                // resolve values for id - first check edits
                const editForId = {...(getEditsForId(loadId) || getValuesForId(loadId))};

                // snipe session is existing - use given settings id's if provided
                _initialValues = {
                    ...editForId,
                    gasPriceSettingsId: (typeof(useGasPriceSettingsId) !== 'undefined') ? useGasPriceSettingsId : editForId.gasPriceSettingsId,
                    mevSettingsId: (typeof(useMevSettingsId) !== 'undefined') ? useMevSettingsId : editForId.mevSettingsId,
                    sellTriggerConditionsId: (typeof(useSellTriggerConditionsId) !== 'undefined') ? useSellTriggerConditionsId : editForId.sellTriggerConditionsId,
                    snipeTriggerConditionsId: (typeof(useSnipeTriggerConditionsId) !== 'undefined') ? useSnipeTriggerConditionsId : editForId.snipeTriggerConditionsId,
                    swapParamsId: (typeof(useSwapParamsId) !== 'undefined') ? useSwapParamsId : editForId.swapParamsId,
                    secondTriggerWalletSettingsId: (typeof(useSecondTriggerWalletSettingsId) !== 'undefined') ? useSecondTriggerWalletSettingsId : editForId.secondTriggerWalletSettingsId,
                }
            }
        }
    } catch(e) {
        log(`Error loading initial values for form`);
        console.log(e);
        window.alert(`Error loading initial values for form: ${e.toString()}`);
    }

    if(!_initialValues.swarmAccountIds) {
        _initialValues.swarmAccountIds = [];
    }

    // initialize selection set
    for(const id of _initialValues.swarmAccountIds) {
        selectedAccounts.push(id);
    }

    //const [selectionModel, setSelectionModel] = useState(selectedAccounts);
    const [selectedRows, setSelectedRows] = React.useState([]);

    let selectionModelInitialized = false;
    log(`Initial values: ${JSON.stringify(_initialValues)}`);
    log(`Initial selected accounts: ${JSON.stringify(selectedAccounts)}`);
    //log(`Initial selection model: ${JSON.stringify(selectionModel)}`);

    const getInitialValues = () => {
        return _initialValues;
        // if(useValues) {
        //     log(`Using values from routed state`);
        //     return {...useValues};
        // }
        //
        // if(origin && origin === 'sessions') {
        //     // opening snipe session from list view, could be new or an edit
        //     if(typeof(loadId) === 'undefined') {
        //         // this is a new entry
        //         return initialValues;
        //     }
        //
        //     // this is opening an existing entry
        //     return {
        //         ...(getValuesForId(loadId) || initialValues),
        //         id: (loadMode && loadMode === 'edit') ? loadId : undefined,  // wipe id if it's a copy
        //     }
        // } else if(origin && origin === 'settings') {
        //     // returning to snipe session from editing settings
        //     if(typeof(loadId) === 'undefined') {
        //         // snipe session is new and does not yet have an id
        //         // resolve values for new edit - fall back to initial values
        //         const editValues = {...(newSnipeSessionEdit || initialValues)};
        //
        //         // snipe session is new - use given settings id's if provided
        //         return {
        //             ...editValues,
        //             gasPriceSettingsId: (typeof(useGasPriceSettingsId) !== 'undefined') ? useGasPriceSettingsId : editValues.gasPriceSettingsId,
        //             mevSettingsId: (typeof(useMevSettingsId) !== 'undefined') ? useMevSettingsId : editValues.mevSettingsId,
        //             sellTriggerConditionsId: (typeof(useSellTriggerConditionsId) !== 'undefined') ? useSellTriggerConditionsId : editValues.sellTriggerConditionsId,
        //             snipeTriggerConditionsId: (typeof(useSnipeTriggerConditionsId) !== 'undefined') ? useSnipeTriggerConditionsId : editValues.snipeTriggerConditionsId,
        //             swapParamsId: (typeof(useSwapParamsId) !== 'undefined') ? useSwapParamsId : editValues.swapParamsId,
        //         }
        //     }
        //
        //     // resolve values for id - first check edits
        //     const editForId = {...(getEditsForId(loadId) || getValuesForId(loadId))};
        //
        //     // snipe session is existing - use given settings id's if provided
        //     return {
        //         ...editForId,
        //         gasPriceSettingsId: (typeof(useGasPriceSettingsId) !== 'undefined') ? useGasPriceSettingsId : editForId.gasPriceSettingsId,
        //         mevSettingsId: (typeof(useMevSettingsId) !== 'undefined') ? useMevSettingsId : editForId.mevSettingsId,
        //         sellTriggerConditionsId: (typeof(useSellTriggerConditionsId) !== 'undefined') ? useSellTriggerConditionsId : editForId.sellTriggerConditionsId,
        //         snipeTriggerConditionsId: (typeof(useSnipeTriggerConditionsId) !== 'undefined') ? useSnipeTriggerConditionsId : editForId.snipeTriggerConditionsId,
        //         swapParamsId: (typeof(useSwapParamsId) !== 'undefined') ? useSwapParamsId : editForId.swapParamsId,
        //     }
        // }
        //
        // return {...initialValues}
    }

    // =================================================================================================================
    //
    //  settings actions handlers
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
                    origin: 'session',  // origin - will return here on save
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
                    origin: 'session',  // origin - will return here on save
                    originId: values.id  // session id to load, upon return, otherwise load from newEdit storage
                }
            }
        );
    }

    const handleCreateSettings = (values, route) => {
        log(`Saving edit`);
        saveEdit(values);
        log(`Creating new settings for ${route}`);

        navigate(
            route,
            {
                state: {
                    loadMode: 'new',  // mode - indicating to edit existing settings
                    origin: 'session',  // origin - will return here on save
                    originId: values.id  // session id to load, upon return, otherwise load from newEdit storage
                }
            }
        );
    }

    // =================================================================================================================
    //
    //  swap params actions handlers
    //
    // =================================================================================================================

    const handleEditSwapParams = (id, values) => {
        log(`Editing swap params: ${id}`);
        handleEditSettings(id, values, '/swap-params');
    }

    const handleDuplicateSwapParams = (id, values) => {
        log(`Duplicating swap params: ${id}`);
        handleDuplicateSettings(id, values, '/swap-params');
    }

    const handleCreateSwapParams = (values) => {
        log(`Creating new swap params`);
        handleCreateSettings(values, '/swap-params')
    }

    // =================================================================================================================
    //
    //  snipe trigger conditions actions handlers
    //
    // =================================================================================================================

    const handleEditSnipeTriggerConditions = (id, values) => {
        log(`Editing snipe trigger conditions: ${id}`);
        handleEditSettings(id, values, '/snipe-trigger-conditions');
    }

    const handleDuplicateSnipeTriggerConditions = (id, values) => {
        log(`Duplicating snipe trigger conditions: ${id}`);
        handleDuplicateSettings(id, values, '/snipe-trigger-conditions');
    }

    const handleCreateSnipeTriggerConditions = (values) => {
        log(`Creating new snipe trigger conditions`);
        handleCreateSettings(values, '/snipe-trigger-conditions')
    }

    // =================================================================================================================
    //
    //  sell trigger conditions actions handlers
    //
    // =================================================================================================================

    const handleEditSellTriggerConditions = (id, values) => {
        log(`Editing sell trigger conditions: ${id}`);
        handleEditSettings(id, values, '/sell-trigger-conditions');
    }

    const handleDuplicateSellTriggerConditions = (id, values) => {
        log(`Duplicating sell trigger conditions: ${id}`);
        handleDuplicateSettings(id, values, '/sell-trigger-conditions');
    }

    const handleCreateSellTriggerConditions = (values) => {
        log(`Creating new sell trigger conditions`);
        handleCreateSettings(values, '/sell-trigger-conditions')
    }

    // =================================================================================================================
    //
    //  mev settings actions handlers
    //
    // =================================================================================================================

    const handleEditMevSettings = (id, values) => {
        log(`Editing MEV settings: ${id}`);
        handleEditSettings(id, values, '/mev-settings');
    }

    const handleDuplicateMevSettings = (id, values) => {
        log(`Duplicating MEV settings: ${id}`);
        handleDuplicateSettings(id, values, '/mev-settings');
    }

    const handleCreateMevSettings = (values) => {
        log(`Creating new MEV settings`);
        handleCreateSettings(values, '/mev-settings')
    }

    // =================================================================================================================
    //
    //  gas price settings actions handlers
    //
    // =================================================================================================================

    const handleEditGasPriceSettings = (id, values) => {
        log(`Editing gas price settings: ${id}`);
        handleEditSettings(id, values, '/gas-price-settings');
    }

    const handleDuplicateGasPriceSettings = (id, values) => {
        log(`Duplicating gas price settings: ${id}`);
        handleDuplicateSettings(id, values, '/gas-price-settings');
    }

    const handleCreateGasPriceSettings = (values) => {
        log(`Creating new gas price settings`);
        handleCreateSettings(values, '/gas-price-settings')
    }

    // =================================================================================================================
    //
    //  second trigger wallet settings actions handlers
    //
    // =================================================================================================================

    const handleEditSecondTriggerWalletSettings = (id, values) => {
        log(`Editing second trigger wallet settings: ${id}`);
        handleEditSettings(id, values, '/second-trigger-wallet-settings');
    }

    const handleDuplicateSecondTriggerWalletSettings = (id, values) => {
        log(`Duplicating second trigger wallet settings: ${id}`);
        handleDuplicateSettings(id, values, '/second-trigger-wallet-settings');
    }

    const handleCreateSecondTriggerWalletSettings = (values) => {
        log(`Creating new second trigger wallet settings`);
        handleCreateSettings(values, '/second-trigger-wallet-settings')
    }

    // =================================================================================================================
    //
    //  accounts handlers
    //
    // =================================================================================================================

    const handleClearMevAcct1Field = (values, setFieldValue) => {
        window.alert('The clear button is not enabled, but leaving account values in this field will have no effect if your MEV settings are not using MEV acct 1');
    }

    const handleClearMevAcct2Field = (values, setFieldValue) => {
        window.alert('The clear button is not enabled, but leaving account values in this field will have no effect if your MEV settings are not using MEV acct 2');
    }

    const handleClearWallet2Field = (values, setFieldValue) => {
        window.alert('The clear button is not enabled, but leaving account values in this field will have no effect if you are not using second trigger wallet');
    }

    const handleCreateAccount = (values) => {
        log(`Creating new account`);
        handleCreateSettings(values, '/account')
    }

    // =================================================================================================================
    //
    //  form submission - save / create snipe session
    //
    // =================================================================================================================

    const handleSaveSnipeSession = (values) => {
        let savedId;

        if(!values) {
            log(`Values undefined - cannot save snipe session`);
            window.alert(`Values undefined - cannot save snipe session`);
            return;
        }

        const {description} = values;

        if(!description) {
            log(`description undefined - cannot save snipe session`);
            window.alert(`description undefined - cannot save snipe session`);
            return;
        }

        log(`Saving settings, with acct selection: ${selectedAccounts} sessionSaved=${sessionSaved} savedSessionId=${savedSessionId}`);
        const {success, message} = validateSnipeSessionValues({
            ...values,
            swarmAccountIds: selectedAccounts,
        });

        try {
            if(
                typeof(values.id) !== 'undefined'
                || (sessionSaved && savedSessionId !== -1)
            ) {
                // TODO - use saved ID
                // snipe session values already have an id (pre-existing / edit)
                let useId = typeof(values.id) !== 'undefined' ? values.id : savedSessionId;

                if(typeof(savedSessionId) === 'undefined') {
                    console.log(`Saved session ID undefined - aborting`);
                    window.alert(`Saved session ID undefined - aborting`);
                    return;
                }

                let index = -1;

                for(let i = 0; i < snipeSessionSettings.length; i++) {
                    const { id } = snipeSessionSettings[i];

                    if(useId === id) {
                        index = i;
                        break;
                    }
                }

                if(index === -1) {
                    // did not find
                    if(!isDescriptionUnique(description, snipeSessionSettings || [])) {
                        log(`description must be unique - already have an entry for:\n\n${description}`);
                        window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                        return;
                    }

                    // we didnt find session id -> add to array
                    snipeSessionSettings.push({
                        ...values,
                        swarmAccountIds: selectedAccounts,
                        id: useId,
                    });
                } else {
                    // we found id -> update the values
                    snipeSessionSettings[index] = {
                        ...values,
                        swarmAccountIds: selectedAccounts,
                        id: useId,
                    };
                }

                setSessionSaved(true);
                setSavedSessionId(useId);
                savedId = useId;
            } else {
                if(!isDescriptionUnique(description, snipeSessionSettings || [])) {
                    log(`description must be unique - already have an entry for:\n\n${description}`);
                    window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                    return;
                }

                // snipe session does not have id -> new
                let newId = getRandomInt();

                while(true) {
                    let canBreak = true;

                    for(const item of snipeSessionSettings) {
                        if(item && (item.id === newId)) {
                            canBreak = false;
                            break;
                        }
                    }

                    if(!canBreak) {
                        newId = getRandomInt();
                        continue;
                    }

                    break;
                }

                const nextId = newId;
                //console.log(`Next id is ${nextId}`);

                snipeSessionSettings.push({
                    ...values,
                    swarmAccountIds: selectedAccounts,
                    id: nextId,
                });

                savedId = nextId;
            }

            setSnipeSessionSettings(snipeSessionSettings);
            setSessionSaved(true);
            setSavedSessionId(savedId);

            if(typeof(values.id) !== 'undefined') {
                window.alert(`Settings updated for Snipe Session # ${values.id} with description:\n ${values.description} ${success ? '' : ('\n\nWARNING: Settings failed validation: ' + message + '\nThey will still be saved, but will not pass validation if sent to sniper app')}`);
            } else {
                window.alert(`Settings saved as Snipe Session # ${savedId} with description: \n ${values.description} ${success ? '' : ('\n\nWARNING: Settings failed validation: ' + message + '\nThey will still be saved, but will not pass validation if sent to sniper app')}`);
            }
        } catch(e) {
            log(`Error saving snipe session`);
            console.log(e);
            window.alert(`Error saving snipe session: ${e.toString()}`);
        }
    }

    const handleValidateSettings = (values) => {
        handleSaveSnipeSession(values);
        _updateSettings(values).then();
    }

    const handleSaveSnipeSessionAndReturn = (values) => {
        handleSaveSnipeSession(values);
        navigate('/sessions');
    }

    const handleCancel = () => {
        navigate('/sessions');
    }

    // =================================================================================================================
    //
    //  settings validation
    //
    // =================================================================================================================

    const _updateSettings = async (values) => {
        /**
         *  - save accounts -> updateAccounts
         *  - save / validate settings
         *   - tx fields
         *   - gas prices
         *   - snipe conditions
         *   - sell trigger conditions
         *   - mev settings
         */

        log('Updating / validating settings');

        try {
            if(!values.tokenContractAddress) {
                log(`Target token address undefined - cannot validate settings`);
                window.alert(`Target token address undefined - cannot validate settings`);
                return;
            }

            let useId = typeof(values.id) !== 'undefined' ? values.id : savedSessionId;

            if(!useId) {
                log(`Snipe session Id not known - cannot validate / update settings`);
                window.alert(`Snipe session Id not known - cannot validate / update settings`);
                return;
            }

            const updateAccountsResult = await updateAccounts({
                ...values,
                id: useId,
            });

            if(!updateAccountsResult) {return;}

            const updateGasPriceSettingsResult = await updateGasPriceSettings({
                ...values,
                id: useId,
            });

            if(!updateGasPriceSettingsResult) {return;}

            const updateSwapParamsResult = await updateSwapParams({
                ...values,
                id: useId,
            });

            if(!updateSwapParamsResult) {return;}

            const updateSnipeConditionsResult = await updateSnipeConditions({
                ...values,
                id: useId,
            });

            if(!updateSnipeConditionsResult) {return;}

            const updateSellTriggerSettingsResult = await updateSellTriggerSettings({
                ...values,
                id: useId,
            });

            if(!updateSellTriggerSettingsResult) {return;}

            const updateMevSettingsResult = await updateMevSettings({
                ...values,
                id: useId,
            });

            // if(!updateMevSettingsResult) {return;}

            const updateSecondTriggerWalletSettingsResult = await updateSecondTriggerWalletSettings({
                ...values,
                id: useId,
            });

            if(!updateSecondTriggerWalletSettingsResult) {return;}

            // update settingsValidated flag if successful
            if(
                updateAccountsResult
                && updateGasPriceSettingsResult
                && updateSwapParamsResult
                && updateSnipeConditionsResult
                && updateSellTriggerSettingsResult
                // && updateMevSettingsResult
                && updateSecondTriggerWalletSettingsResult
            ) {
                log(`Settings validated for snipe session ${useId}`);
                window.alert(`All settings validated for snipe session ${useId}`);
                setSettingsValidated(true);
            }
        } catch(e) {
            log(`Error validating / updating settings`);
            console.log(e);
            window.alert(`Error validating / updating settings: ${e.toString()}`);
        }
    }

    const getAccountAtId = (id) => {
        try {
            return accounts.filter(o => (
                o
                && typeof(o.id) !== 'undefined'
                && (o.id === id)
            ))[0];
        } catch(e) {
            log(`Error getting account for id`);
            console.log(e);
            return undefined;
        }
    }

    const updateAccounts = async (values) => {
        log('Updating accounts');

        try {
            if(!selectedAccounts) {
                log(`Selection model undefined - cannot update accounts`);
                window.alert(`Selection model undefined - cannot update accounts`);
                return false;
            }

            if(selectedAccounts.length === 0) {
                log(`No accounts selected - cannot update accounts`);
                window.alert(`No accounts selected - cannot update accounts`);
                return false;
            }

            const useAccounts = accounts.filter(_account => {
                return (
                    _account
                    && selectedAccounts.includes(_account.id)
                );
            });

            const mevAcct = (typeof(values.mevAcctId) === 'undefined')
                ? undefined
                : getAccountAtId(values.mevAcctId);

            const mevAcct2 = (typeof(values.mevAcct2Id) === 'undefined')
                ? undefined
                : getAccountAtId(values.mevAcct2Id);

            const wallet2 = (typeof(values.wallet2Id) === 'undefined')
                ? undefined
                : getAccountAtId(values.wallet2Id);

            setWaiting(true);

            const [err, data] = await sendCommandWithPromise(SNIPER_SERVER_URL, 'updateAccounts', 'async', {
                snipeSessionId: values.id,
                swarmAccounts: useAccounts,
                mevAcct,
                mevAcct2,
                wallet2,
                snipeMode: 'manual',
            });

            setWaiting(false);

            if(err) {
                // TODO - take no action
            } else if(!data) {
                log(`Data undefined in response to update accounts`);
                window.alert(`Data undefined in response to update accounts`);
            } else {
                const { success, message, error } = data;

                if(!success) {
                    const _message = `Sniper app failed to update accounts: ${message} ${error ? '\n' + error : ''}`;
                    log(_message);
                    window.alert(_message);
                } else {
                    window.alert(`Accounts updated`);
                    return true;
                }
            }

            return false;
        } catch(e) {
            log(`Error updating accounts`);
            console.log(e);
            window.alert(`Error updating accounts: ${e.toString()}`);
            return false;
        }
    }

    const updateGasPriceSettings = async (values) => {
        log('Updating gas price settings');

        try {
            if(typeof(values.gasPriceSettingsId) === 'undefined') {
                window.alert('No gas price settings saved yet for the current snipe session');
                return false;
            }

            const _useGasPriceSettings = getGasPriceSettingsForId(values.gasPriceSettingsId);

            if(!_useGasPriceSettings) {
                window.alert(`No gas price settings found for the given id ${values.gasPriceSettingsId} - cannot update gas price settings`);
                return false;
            }

            console.log(_useGasPriceSettings)

            setWaiting(true);

            const [err, data] = await sendCommandWithPromise(SNIPER_SERVER_URL, 'updateGasPriceSettings', 'async', {
                snipeSessionId: values.id,
                settings: _useGasPriceSettings,
                snipeMode: 'manual',
            });

            setWaiting(false);

            if(err) {
                // TODO - take no action
            } else if(!data) {
                log(`Data undefined in response to update gas price settings`);
                window.alert(`Data undefined in response to update gas price settings`);
            } else {
                const { success, message, error } = data;

                if(!success) {
                    const _message = `Sniper app failed to update gas price settings: ${message} ${error ? '\n' + error : ''}`;
                    log(_message);
                    window.alert(_message);
                } else {
                    window.alert(`Gas price settings updated`);
                    return true;
                }
            }

            return false;
        } catch(e) {
            log(`Error updating gas price settings`);
            console.log(e);
            window.alert(`Error updating gas price settings: ${e.toString()}`);
            return false;
        }
    }

    const updateSwapParams = async (values) => {
        log('Updating swap params');

        try {
            if(typeof(values.swapParamsId) === 'undefined') {
                window.alert('No swap parameters saved yet for the current snipe session');
                return false;
            }

            const _useSwapParams = getSwapParamsForId(values.swapParamsId);

            if(!_useSwapParams) {
                window.alert(`No swap params found for the given id ${values.swapParamsId} - cannot update swap params`);
                return false;
            }

            _useSwapParams.swapPath = _useSwapParams.swapPath + '';
            setWaiting(true);

            const [err, data] = await sendCommandWithPromise(SNIPER_SERVER_URL, 'updateSwapParams', 'async', {
                snipeSessionId: values.id,
                settings: {
                    ..._useSwapParams,
                    swapPath:  _useSwapParams.swapPath + ` ${values.tokenContractAddress}`,
                    targetTokenAddress: values.tokenContractAddress,
                },
                snipeMode: 'manual',
            });

            setWaiting(false);

            if(err) {
                // TODO - take no action
            } else if(!data) {
                log(`Data undefined in response to update swap params`);
                window.alert(`Data undefined in response to update swap params`);
            } else {
                const { success, message, error } = data;

                if(!success) {
                    const _message = `Sniper app failed to update swap params: ${message} ${error ? '\n' + error : ''}`;
                    log(_message);
                    window.alert(_message);
                } else {
                    window.alert(`Swap params updated`);
                    return true;
                }
            }

            return false;
        } catch(e) {
            log(`Error updating swap params`);
            console.log(e);
            window.alert(`Error updating swap params: ${e.toString()}`);
            return false;
        }
    }

    const updateSnipeConditions = async (values) => {
        log('Updating snipe trigger conditions');

        try {
            if(typeof(values.snipeTriggerConditionsId) === 'undefined') {
                window.alert('No snipe conditions saved yet for the current snipe session');
                return false;
            }

            const _useSnipeTriggerConditions = getSnipeTriggerConditionsForId(values.snipeTriggerConditionsId);

            if(!_useSnipeTriggerConditions) {
                window.alert(`No snipe trigger conditions found for the given id ${values.snipeTriggerConditionsId} - cannot update snipe trigger conditions`);
                return false;
            }

            setWaiting(true);

            const [err, data] = await sendCommandWithPromise(SNIPER_SERVER_URL, 'updateSnipeTriggerConditions', 'async', {
                snipeSessionId: values.id,
                settings: _useSnipeTriggerConditions,
                snipeMode: 'manual',
            });

            setWaiting(false);

            if(err) {
                // TODO - take no action
            } else if(!data) {
                log(`Data undefined in response to update snipe trigger conditions`);
                window.alert(`Data undefined in response to update snipe trigger conditions`);
            } else {
                const { success, message, error } = data;

                if(!success) {
                    const _message = `Sniper app failed to update snipe trigger conditions: ${message} ${error ? '\n' + error : ''}`;
                    log(_message);
                    window.alert(_message);
                } else {
                    window.alert(`Snipe trigger conditions updated`);
                    return true;
                }
            }

            return false;
        } catch(e) {
            log(`Error updating snipe trigger conditions`);
            console.log(e);
            window.alert(`Error updating snipe trigger conditions: ${e.toString()}`);
            return false;
        }
    }

    const updateSellTriggerSettings = async (values) => {
        log('Updating sell trigger conditions');

        try {
            if(typeof(values.sellTriggerConditionsId) === 'undefined') {
                window.alert('No sell trigger conditions saved yet for the current snipe session');
                return false;
            }

            const _useSellTriggerConditions = getSellTriggerConditionsForId(values.sellTriggerConditionsId);

            if(!_useSellTriggerConditions) {
                window.alert(`No sell trigger conditions found for the given id ${values.sellTriggerConditionsId} - cannot update sell trigger conditions`);
                return false;
            }

            setWaiting(true);

            const [err, data] = await sendCommandWithPromise(SNIPER_SERVER_URL, 'updateSellTriggerConditions', 'async', {
                snipeSessionId: values.id,
                settings: _useSellTriggerConditions,
                snipeMode: 'manual',
            });

            setWaiting(false);

            if(err) {
                // TODO - take no action
            } else if(!data) {
                log(`Data undefined in response to update sell trigger conditions`);
                window.alert(`Data undefined in response to update sell trigger conditions`);
            } else {
                const { success, message, error } = data;

                if(!success) {
                    const _message = `Sniper app failed to update sell trigger conditions: ${message} ${error ? '\n' + error : ''}`;
                    log(_message);
                    window.alert(_message);
                } else {
                    window.alert(`Sell trigger conditions updated`);
                    return true;
                }
            }

            return false;
        } catch(e) {
            log(`Error updating sell trigger conditions`);
            console.log(e);
            window.alert(`Error updating sell trigger conditions: ${e.toString()}`);
            return false;
        }
    }

    const updateMevSettings = async (values) => {
        log('Updating MEV settings');

        try {
            if(typeof(values.mevSettingsId) === 'undefined') {
                window.alert('No MEV settings saved yet for the current snipe session');
                return false;
            }

            const _useMevSettings = getMevSettingsForId(values.mevSettingsId);

            if(!_useMevSettings) {
                window.alert(`No MEV settings found for the given id ${values.mevSettingsId} - cannot update MEV settings`);
                return false;
            }

            // get keys for selected accounts
            const mevAcct = (typeof(values.mevAcctId) === 'undefined')
                ? undefined
                : getAccountAtId(values.mevAcctId);

            const mevAcct2 = (typeof(values.mevAcct2Id) === 'undefined')
                ? undefined
                : getAccountAtId(values.mevAcct2Id);

            _useMevSettings.mevAccountPrivateKey = !!mevAcct ? mevAcct.privateKey : undefined;
            _useMevSettings.mevAccount2PrivateKey = !!mevAcct2 ? mevAcct2.privateKey : undefined;

            setWaiting(true);

            const [err, data] = await sendCommandWithPromise(SNIPER_SERVER_URL, 'updateMevSettings', 'async', {
                snipeSessionId: values.id,
                settings: _useMevSettings,
                snipeMode: 'manual',
            });

            setWaiting(false);

            if(err) {
                // TODO - take no action
            } else if(!data) {
                log(`Data undefined in response to update MEV settings`);
                window.alert(`Data undefined in response to update MEV settings`);
            } else {
                const { success, message, error } = data;

                if(!success) {
                    const _message = `Sniper app failed to update MEV settings: ${message} ${error ? '\n' + error : ''}`;
                    log(_message);
                    window.alert(_message);
                } else {
                    window.alert(`MEV settings updated`);
                    return true;
                }
            }

            return false;
        } catch(e) {
            log(`Error updating MEV settings`);
            console.log(e);
            window.alert(`Error updating MEV settings: ${e.toString()}`);
            return false;
        }
    }

    const updateSecondTriggerWalletSettings = async (values) => {
        log('Updating second trigger wallet settings');

        try {
            if(typeof(values.secondTriggerWalletSettingsId) === 'undefined') {
                window.alert('No second trigger wallet settings saved yet for the current snipe session');
                return false;
            }

            const _useSecondTriggerSettings = getSecondTriggerWalletSettingsForId(values.secondTriggerWalletSettingsId);

            if(!_useSecondTriggerSettings) {
                window.alert(`No second trigger wallet settings found for the given id ${values.secondTriggerWalletSettingsId} - cannot update second trigger wallet settings`);
                return false;
            }

            // get keys for selected accounts
            const wallet2 = (typeof(values.wallet2Id) === 'undefined')
                ? undefined
                : getAccountAtId(values.wallet2Id);

            _useSecondTriggerSettings.secondaryTriggerWallet = !!wallet2 ? wallet2.privateKey : undefined;
            setWaiting(true);

            const [err, data] = await sendCommandWithPromise(SNIPER_SERVER_URL, 'updateSecondTriggerWalletSettings', 'async', {
                snipeSessionId: values.id,
                settings: _useSecondTriggerSettings,
                snipeMode: 'manual',
            });

            setWaiting(false);

            if(err) {
                // TODO - take no action
            } else if(!data) {
                log(`Data undefined in response to update second trigger wallet settings`);
                window.alert(`Data undefined in response to update second trigger wallet settings`);
            } else {
                const { success, message, error } = data;

                if(!success) {
                    const _message = `Sniper app failed to update second trigger wallet settings: ${message} ${error ? '\n' + error : ''}`;
                    log(_message);
                    window.alert(_message);
                } else {
                    window.alert(`Second trigger wallet settings updated`);
                    return true;
                }
            }

            return false;
        } catch(e) {
            log(`Error second trigger wallet settings`);
            console.log(e);
            window.alert(`Error updating second trigger wallet settings: ${e.toString()}`);
            return false;
        }
    }

    // =================================================================================================================
    //
    //  controls
    //
    // =================================================================================================================

    const handleStartSnipeSession = (values) => {
        // validate settings first (use SAVE SETTINGS AND VALIDATE button)
        log(`Starting snipe session`);

        try {
            if(!settingsValidated) {
                window.alert('Please validate settings before trying to start sniper');
                return;
            }

            let useId = typeof(values.id) !== 'undefined' ? values.id : savedSessionId;

            if(!useId) {
                log(`Snipe session Id not known / saved properly - cannot perform operation`);
                window.alert(`Snipe session Id not known / saved properly - cannot perform operation`);
                return;
            }

            if(window.confirm(`Are you sure you want to START snipe session ${useId} for token ${values.tokenContractName} at address ${values.tokenContractAddress}?`)) {
                setWaiting(true);

                sendCommand(SNIPER_SERVER_URL, 'startSnipeSession', 'async', {
                    snipeSessionId: useId,
                    snipeMode: 'manual',
                }, (err, data) => {
                    if(err) {
                        // TODO - take no action
                    } else if(!data) {
                        log(`Data undefined in response to start snipe session`);
                        window.alert(`Data undefined in response to start snipe session`);
                    } else {
                        const { success, message, error } = data;

                        if(!success) {
                            const _message = `Sniper app failed to start snipe session: ${message}`;
                            log(_message);
                            window.alert(_message);
                        } else {
                            window.alert(`Snipe session ${useId} started`);
                        }
                    }

                    setWaiting(false);
                });
            }
        } catch(e) {
            log(`Error starting snipe session`);
            console.log(e);
            window.alert(`Error starting snipe session: ${e.toString()}`);
        }
    }

    const handleActivateSnipeSession = (values) => {
        log(`Activating snipe session`);

        try {
            let useId = typeof(values.id) !== 'undefined' ? values.id : savedSessionId;

            if(!useId) {
                log(`Snipe session Id not known / saved properly - cannot perform operation`);
                window.alert(`Snipe session Id not known / saved properly - cannot perform operation`);
                return;
            }

            if(window.confirm(`Are you sure you want to ACTIVATE snipe session ${useId} for token ${values.tokenContractName} at address ${values.tokenContractAddress}?`)) {
                setWaiting(true);

                sendCommand(SNIPER_SERVER_URL, 'activateSnipeSession', 'async', {
                    snipeSessionId: useId,
                    snipeMode: 'manual',
                }, (err, data) => {
                    if(err) {
                        // TODO - take no action
                    } else if(!data) {
                        log(`Data undefined in response to activate snipe session`);
                        window.alert(`Data undefined in response to activate snipe session`);
                    } else {
                        const { success, message, error } = data;

                        if(!success) {
                            const _message = `Sniper app failed to activate snipe session: ${message}`;
                            log(_message);
                            window.alert(_message);
                        } else {
                            window.alert(`Snipe session ${useId} activated`);
                        }
                    }

                    setWaiting(false);
                });
            }
        } catch(e) {
            log(`Error activating snipe session`);
            console.log(e);
            window.alert(`Error activating snipe session: ${e.toString()}`);
        }
    }

    const handlePauseSnipeSession = (values) => {
        log(`Pausing snipe session`);

        let useId = typeof(values.id) !== 'undefined' ? values.id : savedSessionId;

        if(!useId) {
            log(`Snipe session Id not known / saved properly - cannot perform operation`);
            window.alert(`Snipe session Id not known / saved properly - cannot perform operation`);
            return;
        }

        window.alert(`Pause button not yet enabled`);
    }

    const handleKillSnipeSession = (values) => {
        log(`Killing snipe session`);

        try {
            let useId = typeof(values.id) !== 'undefined' ? values.id : savedSessionId;

            if(!useId) {
                log(`Snipe session Id not known / saved properly - cannot perform operation`);
                window.alert(`Snipe session Id not known / saved properly - cannot perform operation`);
                return;
            }

            if(window.confirm(`Are you sure you want to KILL snipe session ${useId} for token ${values.tokenContractName} at address ${values.tokenContractAddress}?`)) {
                setWaiting(true);

                sendCommand(SNIPER_SERVER_URL, 'killSnipeSession', 'async', {
                    snipeSessionId: useId,
                    snipeMode: 'manual',
                }, (err, data) => {
                    if(err) {
                        // TODO - take no action
                    } else if(!data) {
                        log(`Data undefined in response to kill snipe session`);
                        window.alert(`Data undefined in response to kill snipe session`);
                    } else {
                        const { success, message, error } = data;

                        if(!success) {
                            const _message = `Sniper app failed to kill snipe session: ${message}`;
                            log(_message);
                            window.alert(_message);
                        } else {
                            window.alert(`Snipe session ${useId} killed`);
                        }
                    }

                    setWaiting(false);
                });
            }
        } catch(e) {
            log(`Error killing snipe session`);
            console.log(e);
            window.alert(`Error killing snipe session: ${e.toString()}`);
        }
    }

    const handleRefreshNonces = (values) => {
        window.alert(`Refreshing nonces, if environment activated`);

        // send save environment request to sniper app (requires that it is not currently active)
        sendCommand(SNIPER_SERVER_URL, 'refreshNonces', 'sync', {}, (err, data) => {});
    }

    // =================================================================================================================
    //
    //  options for select boxes
    //
    // =================================================================================================================

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

    const gasPriceSettingsOptions = gasPriceSettings.map((_gasPriceSettings) => {
        return {
            value: _gasPriceSettings.id,
            label: `${_gasPriceSettings.id} - ${_gasPriceSettings.description}`,
        }
    });

    const mevSettingsOptions = mevSettings.map((_mevSettings) => {
        return {
            value: _mevSettings.id,
            label: `${_mevSettings.id} - ${_mevSettings.description}`,
        }
    });

    const sellTriggerConditionsOptions = sellTriggerConditions.map((_sellTriggerConditions) => {
        return {
            value: _sellTriggerConditions.id,
            label: `${_sellTriggerConditions.id} - ${_sellTriggerConditions.description}`,
        }
    });

    const snipeTriggerConditionsOptions = snipeTriggerConditions.map((_snipeTriggerConditions) => {
        return {
            value: _snipeTriggerConditions.id,
            label: `${_snipeTriggerConditions.id} - ${_snipeTriggerConditions.description}`,
        }
    });

    const swapParamsOptions = swapParams.map((_swapParams) => {
        return {
            value: _swapParams.id,
            label: `${_swapParams.id} - ${_swapParams.description}`,
        }
    });

    const secondTriggerWalletOptions = secondTriggerWalletSettings.map((_secondTriggerWalletSettings) => {
        return {
            value: _secondTriggerWalletSettings.id,
            label: `${_secondTriggerWalletSettings.id} - ${_secondTriggerWalletSettings.description}`,
        }
    });

    const accountsOptions = accounts.map((_accounts) => {
        return {
            value: _accounts.id,
            label: `${_accounts.id} - ${_accounts.address} - ${_accounts.description}`,
        }
    });

    // =================================================================================================================
    //
    //   accounts datagrid
    //
    // =================================================================================================================


    return(
        <Box m="20px" minHeight="85vh">
            <Header title="SNIPE SESSION" subtitle="Create / edit snipe session settings" />

            <Formik
                onSubmit={()=>{}}
                initialValues={getInitialValues()}
                validationSchema={snipeSessionSchema}
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
                                label="Snipe Session ID"
                                onBlur={handleBlur}
                                onChange={(e) => {
                                    handleChange(e);
                                    setSettingsValidated(false);
                                }}
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
                                label="Please provide a brief description / name for the snipe session"
                                onBlur={handleBlur}
                                onChange={(e) => {
                                    handleChange(e);
                                    setSettingsValidated(false);
                                }}
                                value={values.description}
                                name="description"
                                error={!!touched.description && !!errors.description}
                                helperText={touched.description && errors.description}
                                sx={{ gridColumn: "span 3" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Target Token Contract Address"
                                onBlur={handleBlur}
                                onChange={(e) => {
                                    handleChange(e);
                                    setSettingsValidated(false);
                                }}
                                value={values.tokenContractAddress}
                                name="tokenContractAddress"
                                error={!!touched.tokenContractAddress && !!errors.tokenContractAddress}
                                helperText={touched.tokenContractAddress && errors.tokenContractAddress}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Target Token Name"
                                onBlur={handleBlur}
                                onChange={(e) => {
                                    handleChange(e);
                                    setSettingsValidated(false);
                                }}
                                value={values.tokenContractName}
                                name="tokenContractName"
                                error={!!touched.tokenContractName && !!errors.tokenContractName}
                                helperText={touched.tokenContractName && errors.tokenContractName}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Settings
                            </Typography>

                            <Typography
                                variant="h5"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 1" }}
                            >
                                Transaction Fields / Swap Parameters
                            </Typography>

                            <FormControl sx={{
                                gridColumn: "span 2"
                            }}>
                                <Select
                                    options={swapParamsOptions}
                                    name="swapParamsId"
                                    value={(swapParamsOptions ? swapParamsOptions.find(option => option.value === values.swapParamsId) : '')}
                                    onChange={(option) => {
                                        setFieldValue( 'swapParamsId', option.value, false  );
                                        setSettingsValidated(false);
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
                                    <Button color="secondary" variant="contained" onClick={() => { handleEditSwapParams(values.swapParamsId, values) }}>
                                        EDIT
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleDuplicateSwapParams(values.swapParamsId, values) }}>
                                        COPY
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleCreateSwapParams(values) }}>
                                        NEW
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h5"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 1" }}
                            >
                                Snipe Trigger Conditions
                            </Typography>

                            <FormControl sx={{
                                gridColumn: "span 2"
                            }}>
                                <Select
                                    options={snipeTriggerConditionsOptions}
                                    name="snipeTriggerConditionsId"
                                    value={(snipeTriggerConditionsOptions ? snipeTriggerConditionsOptions.find(option => option.value === values.snipeTriggerConditionsId) : '')}
                                    onChange={(option) => {
                                        setFieldValue( 'snipeTriggerConditionsId', option.value, false  );
                                        setSettingsValidated(false);
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
                                    <Button color="secondary" variant="contained" onClick={() => { handleEditSnipeTriggerConditions(values.snipeTriggerConditionsId, values) }}>
                                        EDIT
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleDuplicateSnipeTriggerConditions(values.snipeTriggerConditionsId, values) }}>
                                        COPY
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleCreateSnipeTriggerConditions(values) }}>
                                        NEW
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h5"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 1" }}
                            >
                                Sell Trigger Conditions
                            </Typography>

                            <FormControl sx={{
                                gridColumn: "span 2"
                            }}>
                                <Select
                                    options={sellTriggerConditionsOptions}
                                    name="sellTriggerConditionsId"
                                    value={(sellTriggerConditionsOptions ? sellTriggerConditionsOptions.find(option => option.value === values.sellTriggerConditionsId) : '')}
                                    onChange={(option) => {
                                        setFieldValue( 'sellTriggerConditionsId', option.value, false  );
                                        setSettingsValidated(false);
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
                                    <Button color="secondary" variant="contained" onClick={() => { handleEditSellTriggerConditions(values.sellTriggerConditionsId, values) }}>
                                        EDIT
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleDuplicateSellTriggerConditions(values.sellTriggerConditionsId, values) }}>
                                        COPY
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleCreateSellTriggerConditions(values) }}>
                                        NEW
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h5"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 1" }}
                            >
                                MEV / Executor Contract Settings
                            </Typography>

                            <FormControl sx={{
                                gridColumn: "span 2"
                            }}>
                                <Select
                                    options={mevSettingsOptions}
                                    name="mevSettingsId"
                                    value={(mevSettingsOptions ? mevSettingsOptions.find(option => option.value === values.mevSettingsId) : '')}
                                    onChange={(option) => {
                                        setFieldValue( 'mevSettingsId', option.value, false  );
                                        setSettingsValidated(false);
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
                                    <Button color="secondary" variant="contained" onClick={() => { handleEditMevSettings(values.mevSettingsId, values) }}>
                                        EDIT
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleDuplicateMevSettings(values.mevSettingsId, values) }}>
                                        COPY
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleCreateMevSettings(values) }}>
                                        NEW
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h5"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 1" }}
                            >
                                Gas Price Settings
                            </Typography>

                            <FormControl sx={{
                                gridColumn: "span 2"
                            }}>
                                <Select
                                    options={gasPriceSettingsOptions}
                                    name="gasPriceSettingsId"
                                    value={(gasPriceSettingsOptions ? gasPriceSettingsOptions.find(option => option.value === values.gasPriceSettingsId) : '')}
                                    onChange={(option) => {
                                        setFieldValue( 'gasPriceSettingsId', option.value, false  );
                                        setSettingsValidated(false);
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
                                    <Button color="secondary" variant="contained" onClick={() => { handleEditGasPriceSettings(values.gasPriceSettingsId, values) }}>
                                        EDIT
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleDuplicateGasPriceSettings(values.gasPriceSettingsId, values) }}>
                                        COPY
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleCreateGasPriceSettings(values) }}>
                                        NEW
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h5"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 1" }}
                            >
                                Second Trigger Wallet Settings
                            </Typography>

                            <FormControl sx={{
                                gridColumn: "span 2"
                            }}>
                                <Select
                                    options={secondTriggerWalletOptions}
                                    name="secondTriggerWalletSettingsId"
                                    value={(secondTriggerWalletOptions ? secondTriggerWalletOptions.find(option => option.value === values.secondTriggerWalletSettingsId) : '')}
                                    onChange={(option) => {
                                        setFieldValue( 'secondTriggerWalletSettingsId', option.value, false  );
                                        setSettingsValidated(false);
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
                                    <Button color="secondary" variant="contained" onClick={() => { handleEditSecondTriggerWalletSettings(values.secondTriggerWalletSettingsId, values) }}>
                                        EDIT
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleDuplicateSecondTriggerWalletSettings(values.secondTriggerWalletSettingsId, values) }}>
                                        COPY
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleCreateSecondTriggerWalletSettings(values) }}>
                                        NEW
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Accounts
                            </Typography>

                            <Typography
                                variant="h5"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 1" }}
                            >
                                MEV Account 1
                            </Typography>

                            <FormControl sx={{
                                gridColumn: "span 2"
                            }}>
                                <Select
                                    options={accountsOptions}
                                    name="mevAcctId"
                                    value={(accountsOptions ? accountsOptions.find(option => option.value === values.mevAcctId) : '')}
                                    onChange={(option) => {
                                        setFieldValue( 'mevAcctId', option.value, false  );
                                        setSettingsValidated(false);
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
                                    <Button color="secondary" variant="contained" onClick={() => { handleClearMevAcct1Field(values, setFieldValue) }}>
                                        CLEAR
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h5"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 1" }}
                            >
                                MEV Account 2
                            </Typography>

                            <FormControl sx={{
                                gridColumn: "span 2"
                            }}>
                                <Select
                                    options={accountsOptions}
                                    name="mevAcct2Id"
                                    value={(accountsOptions ? accountsOptions.find(option => option.value === values.mevAcct2Id) : '')}
                                    onChange={(option) => {
                                        setFieldValue( 'mevAcct2Id', option.value, false  );
                                        setSettingsValidated(false);
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
                                    <Button color="secondary" variant="contained" onClick={() => { handleClearMevAcct2Field(values, setFieldValue) }}>
                                        CLEAR
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h5"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 1" }}
                            >
                                Second Trigger Wallet
                            </Typography>

                            <FormControl sx={{
                                gridColumn: "span 2"
                            }}>
                                <Select
                                    options={accountsOptions}
                                    name="wallet2Id"
                                    value={(accountsOptions ? accountsOptions.find(option => option.value === values.wallet2Id) : '')}
                                    onChange={(option) => {
                                        setFieldValue( 'wallet2Id', option.value, false  );
                                        setSettingsValidated(false);
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
                                    <Button color="secondary" variant="contained" onClick={() => { handleClearWallet2Field(values, setFieldValue) }}>
                                        CLEAR
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h5"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 1" }}
                            >
                                Select Swarm Accounts
                            </Typography>

                            <Box display="flex" mt="10px" p="10px" sx={{
                                gridColumn: "span 3"
                            }}>
                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleCreateAccount(values) }}>
                                        Add New Account
                                    </Button>
                                </Box>
                            </Box>


                        </Box>

                        {/*<Box*/}
                        {/*    m="20px 0 20px 0"*/}
                        {/*    sx={{*/}
                        {/*        // "& .MuiDataGrid-root": {*/}
                        {/*        //     border: "none",*/}
                        {/*        // },*/}
                        {/*        "& .MuiDataGrid-cell": {*/}
                        {/*            borderBottom: "none",*/}
                        {/*        },*/}
                        {/*        "& .description-column--cell": {*/}
                        {/*            color: colors.greenAccent[300],*/}
                        {/*        },*/}
                        {/*        "& .MuiDataGrid-columnHeaders": {*/}
                        {/*            backgroundColor: colors.blueAccent[700],*/}
                        {/*            borderBottom: "none",*/}
                        {/*        },*/}
                        {/*        "& .MuiDataGrid-virtualScroller": {*/}
                        {/*            backgroundColor: colors.primary[400],*/}
                        {/*        },*/}
                        {/*        "& .MuiDataGrid-footerContainer": {*/}
                        {/*            borderTop: "none",*/}
                        {/*            backgroundColor: colors.blueAccent[700],*/}
                        {/*        },*/}
                        {/*        '& .MuiCheckbox-root.Mui-checked': {*/}
                        {/*            backgroundColor: colors.greenAccent[400],*/}
                        {/*            borderColor: '#1890ff',*/}
                        {/*        },*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    <DataGrid*/}
                        {/*        // rows={useContext(SwapParamsContext).swapParams}*/}
                        {/*        checkboxSelection*/}
                        {/*        rows={rows}*/}
                        {/*        columns={accountSelectionColumns}*/}
                        {/*        rowSelectionModel={selectionModel}*/}
                        {/*        // onSelectionModelChange={() => {*/}
                        {/*        //     setSelectionModel*/}
                        {/*        // }}*/}
                        {/*        onRowSelectionModelChange={(rowSelectionModel, details) => {*/}
                        {/*            console.log("row selection model changed");*/}
                        {/*            console.log(rowSelectionModel);*/}

                        {/*            for(const id of rowSelectionModel) {*/}
                        {/*                const account = accounts[id];*/}
                        {/*                console.log(`Account ${account.address} is selected`);*/}
                        {/*            }*/}

                        {/*            updateSelectedAccounts(rowSelectionModel);*/}
                        {/*            setSelectionModel(rowSelectionModel);*/}
                        {/*            setSettingsValidated(false);*/}
                        {/*        }}*/}
                        {/*    />*/}
                        {/*</Box>*/}

                        <AccountsUpdater
                            useTargetToken={true}
                            accounts={accounts}
                            updateSelectedAccounts={updateSelectedAccounts}
                            initialSelection={selectedAccounts}
                        >
                        </AccountsUpdater>

                        <Box
                            display="grid"
                            gap="30px"
                            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                            sx={{
                                "& > div": { gridColumn: isNonMobile ? undefined : "span 4"}
                            }}
                        >

                            <Box display="flex" mt="10px" p="10px" sx={{
                                gridColumn: "span 4"
                            }}>
                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleSaveSnipeSession(values) }}>
                                        Save Settings
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleValidateSettings(values) }}>
                                        Save Settings and Validate
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleSaveSnipeSessionAndReturn(values) }}>
                                        Save Settings and Return
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleCancel() }}>
                                        Cancel
                                    </Button>
                                </Box>
                            </Box>

                            {/*<Typography*/}
                            {/*    variant="h4"*/}
                            {/*    color={colors.greenAccent[400]}*/}
                            {/*    sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}*/}
                            {/*>*/}
                            {/*    Controls*/}
                            {/*</Typography>*/}

                            <Box display="flex" mt="10px" p="10px" sx={{
                                gridColumn: "span 4"
                            }}>
                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleStartSnipeSession(values) }}>
                                        Start
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleActivateSnipeSession(values) }}>
                                        Activate
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handlePauseSnipeSession(values) }}>
                                        Pause
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleKillSnipeSession(values) }}>
                                        Kill
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleRefreshNonces(values) }}>
                                        Refresh Nonces
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </form>
                )}
            </Formik>

            {waiting && (<ProgressWheel />)}
        </Box>
    );
};

export default SnipeSession;
