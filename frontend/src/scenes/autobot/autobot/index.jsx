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
import {getRandomInt, isDescriptionUnique, stringify} from "../../../utils/utils";
import {DataGrid, useGridApiContext, useGridApiRef} from "@mui/x-data-grid";
import {getStatus, getStatusWithoutAlert} from "../../../utils/getStatus";
import {SNIPER_SERVER_URL} from "../../../utils/constants";
import {sendCommand, sendCommandWithPromise} from "../../../utils/sendCommand";
import ProgressWheel from "../../../components/ProgressWheel";
import {validateSnipeSessionValues} from "../../../utils/validators/validateSnipeSessionValues";
import defaultAccounts, {ensureDefaultAccounts} from "../../../data/defaults/defaultAccounts";
import {ensureDefaultSwapParams} from "../../../data/defaults/defaultSwapParamsPresets";
import autobotSettingsSchema from "../../../data/schemas/autobotSettingsSchema";
import {validateSwapParamsForAutobot} from "../../../utils/validators/validateSwapParamsForAutobot";
import Modal, {ModalBody, ModalFooter, ModalHeader} from "../../../components/Modal";
import AccountsUpdater from "../../../components/AccountsUpdater";
import AutobotPoolsTable from "../../../components/AutobotPoolsTable";
import AutobotResultsTable from "../../../components/AutobotResultsTable";
import AutobotSnipeAttemptsTable from "../../../components/AutobotSnipeAttemptsTable";
import AutobotSellAttemptsTable from "../../../components/AutobotSellAttemptsTable";

const initialValues = {
    id: undefined,
    description: "",

    gasPriceSettingsId: undefined,
    mevSettingsId: undefined,
    sellTriggerConditionsId: undefined,
    snipeTriggerConditionsId: undefined,
    swapParamsId: undefined,

    // accounts
    swarmAccountIds: [],
};

const Autobot = () => {
    const componentName = 'Autobot';
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
    } = (!!state ? state : {});

    const isNonMobile = useMediaQuery("(min-width:600px");
    const navigate = useNavigate();
    const [autobotSettings, setAutobotSettings] = useSessionStorage('autobotSettings', []);
    const [autobotSettingsEdits, setAutobotSettingsEdits] = useSessionStorage('autobotSettingsEdits', []);
    const [newAutobotSettingsEdit, setNewAutobotSettingsEdit] = useSessionStorage('newAutobotSettingsEdit', undefined);

    // settings storage
    const [botGasPriceSettings, setBotGasPriceSettings] = useSessionStorage('botGasPriceSettings', []);
    const [botMevSettings, setBotMevSettings] = useSessionStorage('botMevSettings', []);
    const [botSellTriggerConditions, setBotSellTriggerConditions] = useSessionStorage('botSellTriggerConditions', []);
    const [botSnipeTriggerConditions, setBotSnipeTriggerConditions] = useSessionStorage('botSnipeTriggerConditions', []);
    const [botSwapParams, setBotSwapParams] = useSessionStorage('botSwapParams', []);
    const [accounts, setAccounts] = useSessionStorage('accounts', defaultAccounts);

    // const [rows, setRows] = useState(accounts || []);

    const [sessionSaved, setSessionSaved] = useState(false);
    const [savedSessionId, setSavedSessionId] = useState(-1);

    const [waiting, setWaiting] = useState(false);
    const [count, setCount] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [modalText, setModalText] = useState('SAMPLE MODAL TEXT');

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

    log(`Loading autbot settings from origin ${origin} with loadId ${loadId} and mode ${loadMode}`);

    let selectedAccounts = [];

    const updateSelectedAccounts = (ids) => {
        log(`Updating selected accounts to:`);
        console.log(ids);
        selectedAccounts = !!ids ? ids.slice() : [];
        setSettingsValidated(false);
    }

    const getValuesForId = (id) => {
        try {
            return autobotSettings.filter(o => (
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
            return autobotSettingsEdits.filter(o => (
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
            return botGasPriceSettings.filter(o => (
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
            return botSwapParams.filter(o => (
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
            return botMevSettings.filter(o => (
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
            return botSnipeTriggerConditions.filter(o => (
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
            return botSellTriggerConditions.filter(o => (
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

    const updateEditForId = (editId, values) => {
        let foundEdit = false;

        try {
            for(let i = 0; i < autobotSettingsEdits.length; i++) {
                if(autobotSettingsEdits[i].id === editId) {
                    autobotSettingsEdits[i] = {...values};
                    foundEdit = true;
                    break;
                }
            }

            if(!foundEdit) {
                autobotSettingsEdits.push({
                    ...values,
                    id: editId,
                });
            }

            setAutobotSettingsEdits(autobotSettingsEdits);
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
            setNewAutobotSettingsEdit(values);
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
        } else if(origin && origin === 'autobots') {
            log('Origin is autobots')
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
                const editValues = {...(newAutobotSettingsEdit || initialValues)};

                // snipe session is new - use given settings id's if provided
                _initialValues = {
                    ...editValues,
                    gasPriceSettingsId: (typeof(useGasPriceSettingsId) !== 'undefined') ? useGasPriceSettingsId : editValues.gasPriceSettingsId,
                    mevSettingsId: (typeof(useMevSettingsId) !== 'undefined') ? useMevSettingsId : editValues.mevSettingsId,
                    sellTriggerConditionsId: (typeof(useSellTriggerConditionsId) !== 'undefined') ? useSellTriggerConditionsId : editValues.sellTriggerConditionsId,
                    snipeTriggerConditionsId: (typeof(useSnipeTriggerConditionsId) !== 'undefined') ? useSnipeTriggerConditionsId : editValues.snipeTriggerConditionsId,
                    swapParamsId: (typeof(useSwapParamsId) !== 'undefined') ? useSwapParamsId : editValues.swapParamsId,
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

    // const [selectionModel, setSelectionModel] = useState(selectedAccounts);
    // const [selectedRows, setSelectedRows] = React.useState([]);

    let selectionModelInitialized = false;
    log(`Initial values: ${JSON.stringify(_initialValues)}`);
    log(`Initial selected accounts: ${JSON.stringify(selectedAccounts)}`);

    const getInitialValues = () => {
        return _initialValues;
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
                    origin: 'autobot',  // origin - will return here on save
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
                    origin: 'autobot',  // origin - will return here on save
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
                    origin: 'autobot',  // origin - will return here on save
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
        handleEditSettings(id, values, '/bot-swap-params');
    }

    const handleDuplicateSwapParams = (id, values) => {
        log(`Duplicating swap params: ${id}`);
        handleDuplicateSettings(id, values, '/bot-swap-params');
    }

    const handleCreateSwapParams = (values) => {
        log(`Creating new swap params`);
        handleCreateSettings(values, '/bot-swap-params')
    }

    // =================================================================================================================
    //
    //  snipe trigger conditions actions handlers
    //
    // =================================================================================================================

    const handleEditSnipeTriggerConditions = (id, values) => {
        log(`Editing snipe trigger conditions: ${id}`);
        handleEditSettings(id, values, '/bot-snipe-trigger-conditions');
    }

    const handleDuplicateSnipeTriggerConditions = (id, values) => {
        log(`Duplicating snipe trigger conditions: ${id}`);
        handleDuplicateSettings(id, values, '/bot-snipe-trigger-conditions');
    }

    const handleCreateSnipeTriggerConditions = (values) => {
        log(`Creating new snipe trigger conditions`);
        handleCreateSettings(values, '/bot-snipe-trigger-conditions')
    }

    // =================================================================================================================
    //
    //  sell trigger conditions actions handlers
    //
    // =================================================================================================================

    const handleEditSellTriggerConditions = (id, values) => {
        log(`Editing sell trigger conditions: ${id}`);
        handleEditSettings(id, values, '/bot-sell-trigger-conditions');
    }

    const handleDuplicateSellTriggerConditions = (id, values) => {
        log(`Duplicating sell trigger conditions: ${id}`);
        handleDuplicateSettings(id, values, '/bot-sell-trigger-conditions');
    }

    const handleCreateSellTriggerConditions = (values) => {
        log(`Creating new sell trigger conditions`);
        handleCreateSettings(values, '/bot-sell-trigger-conditions')
    }

    // =================================================================================================================
    //
    //  mev settings actions handlers
    //
    // =================================================================================================================

    const handleEditMevSettings = (id, values) => {
        log(`Editing MEV settings: ${id}`);
        handleEditSettings(id, values, '/bot-mev-settings');
    }

    const handleDuplicateMevSettings = (id, values) => {
        log(`Duplicating MEV settings: ${id}`);
        handleDuplicateSettings(id, values, '/bot-mev-settings');
    }

    const handleCreateMevSettings = (values) => {
        log(`Creating new MEV settings`);
        handleCreateSettings(values, '/bot-mev-settings')
    }

    // =================================================================================================================
    //
    //  gas price settings actions handlers
    //
    // =================================================================================================================

    const handleEditGasPriceSettings = (id, values) => {
        log(`Editing gas price settings: ${id}`);
        handleEditSettings(id, values, '/bot-gas-price-settings');
    }

    const handleDuplicateGasPriceSettings = (id, values) => {
        log(`Duplicating gas price settings: ${id}`);
        handleDuplicateSettings(id, values, '/bot-gas-price-settings');
    }

    const handleCreateGasPriceSettings = (values) => {
        log(`Creating new gas price settings`);
        handleCreateSettings(values, '/bot-gas-price-settings')
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
            log(`Values undefined - cannot save autobot settings`);
            window.alert(`Values undefined - cannot save autobot settings`);
            return;
        }

        const {description} = values;

        if(!description) {
            log(`description undefined - cannot save autobot settings`);
            window.alert(`description undefined - cannot save autobot settings`);
            return;
        }

        log(`Saving settings, with acct selection: ${selectedAccounts} sessionSaved=${sessionSaved} savedSessionId=${savedSessionId}`);
        const {success, message} = validateSnipeSessionValues({
            ...values,
            swarmAccountIds: selectedAccounts,
        }, true);

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

                for(let i = 0; i < autobotSettings.length; i++) {
                    const { id } = autobotSettings[i];

                    if(useId === id) {
                        index = i;
                        break;
                    }
                }

                if(index === -1) {
                    // did not find
                    if(!isDescriptionUnique(description, autobotSettings || [])) {
                        log(`description must be unique - already have an entry for:\n\n${description}`);
                        window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                        return;
                    }

                    // we didnt find session id -> add to array
                    autobotSettings.push({
                        ...values,
                        swarmAccountIds: selectedAccounts,
                        id: useId,
                    });
                } else {
                    // we found id -> update the values
                    autobotSettings[index] = {
                        ...values,
                        swarmAccountIds: selectedAccounts,
                        id: useId,
                    };
                }

                setSessionSaved(true);
                setSavedSessionId(useId);
                savedId = useId;
                values.id = useId;
            } else {
                if(!isDescriptionUnique(description, autobotSettings || [])) {
                    log(`description must be unique - already have an entry for:\n\n${description}`);
                    window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                    return;
                }

                // snipe session does not have id -> new
                let newId = getRandomInt();

                while(true) {
                    let canBreak = true;

                    for(const item of autobotSettings) {
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

                autobotSettings.push({
                    ...values,
                    swarmAccountIds: selectedAccounts,
                    id: nextId,
                });

                savedId = nextId;
            }

            setAutobotSettings(autobotSettings);
            setSessionSaved(true);
            setSavedSessionId(savedId);

            if(typeof(values.id) !== 'undefined') {
                window.alert(`Settings updated for Autobot Session # ${values.id} with description:\n ${values.description} ${success ? '' : ('\n\nWARNING: Settings failed validation: ' + message + '\nThey will still be saved, but will not pass validation if sent to sniper app')}`);
            } else {
                window.alert(`Settings saved as Autobot Session # ${savedId} with description: \n ${values.description} ${success ? '' : ('\n\nWARNING: Settings failed validation: ' + message + '\nThey will still be saved, but will not pass validation if sent to sniper app')}`);
            }

            values.id = savedId;
        } catch(e) {
            log(`Error saving autobot session`);
            console.log(e);
            window.alert(`Error saving autobot session: ${e.toString()}`);
        }
    }

    const handleValidateSettings = (values) => {
        handleSaveSnipeSession(values);
        _updateSettings(values).then();
    }

    const handleSaveSnipeSessionAndReturn = (values) => {
        handleSaveSnipeSession(values);
        navigate('/autobots');
    }

    const handleCancel = () => {
        navigate('/autobots');
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

            let useId = typeof(values.id) !== 'undefined' ? values.id : savedSessionId;

            if(!useId) {
                log(`Autobot settings Id not known - cannot validate / update settings`);
                window.alert(`Autobot settings Id not known - cannot validate / update settings`);
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

            // update settingsValidated flag if successful
            if(
                updateAccountsResult
                && updateGasPriceSettingsResult
                && updateSwapParamsResult
                && updateSnipeConditionsResult
                && updateSellTriggerSettingsResult
                // && updateMevSettingsResult
            ) {
                log(`Settings validated for autobot session ${useId}`);
                window.alert(`All settings validated for autobot session ${useId}`);
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

            setWaiting(true);

            const [err, data] = await sendCommandWithPromise(SNIPER_SERVER_URL, 'updateAccounts', 'async', {
                snipeSessionId: values.id,
                swarmAccounts: useAccounts,
                snipeMode: 'bot',
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
                    //window.alert(`Accounts updated`);
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
                window.alert('No gas price settings saved yet for the current session');
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
                snipeMode: 'bot',
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
                    //window.alert(`Gas price settings updated`);
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
                window.alert('No swap parameters saved yet for the current session');
                return false;
            }

            const _useSwapParams = getSwapParamsForId(values.swapParamsId);

            if(!_useSwapParams) {
                window.alert(`No swap params found for the given id ${values.swapParamsId} - cannot update swap params`);
                return false;
            }

            const validationResult = validateSwapParamsForAutobot(_useSwapParams);

            if(!validationResult.success) {
                window.alert(`Failed swap params validation: ${validationResult.message}`);
                return false;
            }

            setWaiting(true);

            const [err, data] = await sendCommandWithPromise(SNIPER_SERVER_URL, 'updateSwapParams', 'async', {
                snipeSessionId: values.id,
                settings: {
                    ..._useSwapParams,
                },
                snipeMode: 'bot',
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
                    //window.alert(`Swap params updated`);
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
                window.alert('No snipe conditions saved yet for the current session');
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
                snipeMode: 'bot',
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
                    //window.alert(`Snipe trigger conditions updated`);
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
                window.alert('No sell trigger conditions saved yet for the current session');
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
                snipeMode: 'bot',
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
                    //window.alert(`Sell trigger conditions updated`);
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
                window.alert('No MEV settings saved yet for the current session');
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
                snipeMode: 'bot',
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
                    //window.alert(`MEV settings updated`);
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

    // =================================================================================================================
    //
    //  controls
    //
    // =================================================================================================================

    const handleStartSnipeSession = (values) => {
        // validate settings first (use SAVE SETTINGS AND VALIDATE button)
        log(`Starting autobot session`);

        try {
            if(!settingsValidated) {
                window.alert('Please validate settings before trying to start sniper');
                return;
            }

            let useId = typeof(values.id) !== 'undefined' ? values.id : savedSessionId;

            if(!useId) {
                log(`Autobot session Id not known / saved properly - cannot perform operation`);
                window.alert(`Autobot session Id not known / saved properly - cannot perform operation`);
                return;
            }

            if(window.confirm(`Are you sure you want to START Autobot session ${useId}?`)) {
                setWaiting(true);

                sendCommand(SNIPER_SERVER_URL, 'startSnipeSession', 'async', {
                    snipeSessionId: useId,
                    snipeMode: 'bot',
                }, (err, data) => {
                    if(err) {
                        // TODO - take no action
                    } else if(!data) {
                        log(`Data undefined in response to start Autobot session`);
                        window.alert(`Data undefined in response to start Autobot session`);
                    } else {
                        const { success, message, error } = data;

                        if(!success) {
                            const _message = `Sniper app failed to start Autobot session: ${message}`;
                            log(_message);
                            window.alert(_message);
                        } else {
                            window.alert(`Autobot session ${useId} started`);
                        }
                    }

                    setWaiting(false);
                });
            }
        } catch(e) {
            log(`Error starting Autobot session`);
            console.log(e);
            window.alert(`Error starting Autobot session: ${e.toString()}`);
        }
    }

    const handleActivateSnipeSession = (values) => {
        log(`Activating Autobot session`);

        try {
            let useId = typeof(values.id) !== 'undefined' ? values.id : savedSessionId;

            if(!useId) {
                log(`Autobot session Id not known / saved properly - cannot perform operation`);
                window.alert(`Autobot session Id not known / saved properly - cannot perform operation`);
                return;
            }

            if(window.confirm(`Are you sure you want to ACTIVATE Autobot session ${useId}?`)) {
                setWaiting(true);

                sendCommand(SNIPER_SERVER_URL, 'activateSnipeSession', 'async', {
                    snipeSessionId: useId,
                    snipeMode: 'bot',
                }, (err, data) => {
                    if(err) {
                        // TODO - take no action
                    } else if(!data) {
                        log(`Data undefined in response to activate Autobot session`);
                        window.alert(`Data undefined in response to activate Autobot session`);
                    } else {
                        const { success, message, error } = data;

                        if(!success) {
                            const _message = `Sniper app failed to activate Autobot session: ${message}`;
                            log(_message);
                            window.alert(_message);
                        } else {
                            window.alert(`Autobot session ${useId} activated`);
                        }
                    }

                    setWaiting(false);
                });
            }
        } catch(e) {
            log(`Error activating Autobot session`);
            console.log(e);
            window.alert(`Error activating Autobot session: ${e.toString()}`);
        }
    }

    const handlePauseSnipeSession = (values) => {
        log(`Pausing Autobot session`);

        let useId = typeof(values.id) !== 'undefined' ? values.id : savedSessionId;

        if(!useId) {
            log(`Autobot session Id not known / saved properly - cannot perform operation`);
            window.alert(`Autobot session Id not known / saved properly - cannot perform operation`);
            return;
        }

        window.alert(`Pause button not yet enabled`);
    }

    const handleKillSnipeSession = (values) => {
        log(`Killing Autobot session`);

        try {
            let useId = typeof(values.id) !== 'undefined' ? values.id : savedSessionId;

            if(!useId) {
                log(`Autobot session Id not known / saved properly - cannot perform operation`);
                window.alert(`Autobot session Id not known / saved properly - cannot perform operation`);
                return;
            }

            if(window.confirm(`Are you sure you want to KILL Autobot session ${useId}?`)) {
                setWaiting(true);

                sendCommand(SNIPER_SERVER_URL, 'killSnipeSession', 'async', {
                    snipeSessionId: useId,
                    snipeMode: 'bot',
                }, (err, data) => {
                    if(err) {
                        // TODO - take no action
                    } else if(!data) {
                        log(`Data undefined in response to kill Autobot session`);
                        window.alert(`Data undefined in response to kill Autobot session`);
                    } else {
                        const { success, message, error } = data;

                        if(!success) {
                            const _message = `Sniper app failed to kill Autobot session: ${message}`;
                            log(_message);
                            window.alert(_message);
                        } else {
                            window.alert(`Autobot session ${useId} killed`);
                        }
                    }

                    setWaiting(false);
                });
            }
        } catch(e) {
            log(`Error killing Autobot session`);
            console.log(e);
            window.alert(`Error killing Autobot session: ${e.toString()}`);
        }
    }

    const handleRefreshNonces = (values) => {
        window.alert(`Refreshing nonces, if environment activated`);

        // send save environment request to sniper app (requires that it is not currently active)
        sendCommand(SNIPER_SERVER_URL, 'refreshNonces', 'sync', {}, (err, data) => {});
    }

    const handleViewSniperCache = (mode) => {
        setWaiting(true);

        getStatus(SNIPER_SERVER_URL, mode, {}, (err, data) => {
            setWaiting(false);

            if(err) {
                // TODO - take no action
            } else if(!data) {
                log(`Data undefined in response for ${mode}`);
                window.alert(`Data undefined in response for ${mode}`);
            } else {
                log(`Got response data:`);
                console.log(data);
                setModalText(data ? stringify(data) : undefined);
                setShowModal(true);
            }
        });
    }

    // =================================================================================================================
    //
    //  clearing cache handlers
    //
    // =================================================================================================================

    const handleClearPools = (mode) => {
        if(mode === 'all') {
            if(!window.confirm(`Are you sure you want to clear ALL POOLS from cache?\nThe script will no longer be able to send snipe, approval or sell txns for any of the pools cleared.`)) {
                return;
            }
        } else if(mode === 'sniped') {
            if(!window.confirm(`Are you sure you want to clear all SNIPED POOLS from cache?\nThe script will no longer be able to send approval or sell txns for any of the pools cleared.`)) {
                return;
            }
        } else if(mode === 'non_sniped') {
            if(!window.confirm(`Are you sure you want to clear all NON-SNIPED POOLS from cache?\nThe script will no longer be able to send snipe, approval or sell txns for any of the pools cleared.`)) {
                return;
            }
        }

        // send command
        sendCommand(SNIPER_SERVER_URL, 'clearPools', 'sync', {
            mode,
        }, (err, data) => {})
    }

    const handleClearResults = (mode) => {
        if(mode === 'all') {
            if(!window.confirm(`Are you sure you want to clear ALL RESULTS from cache?\nThe script will no longer be able to send approvals or sell txns for any of the cleared results.`)) {
                return;
            }
        } else if(mode === 'sold') {
            if(!window.confirm(`Are you sure you want to clear all SOLD RESULTS from cache?`)) {
                return;
            }
        } else if(mode === 'unsold') {
            if(!window.confirm(`Are you sure you want to clear all UNSOLD RESULTS from cache?\nThe script will no longer be able to send approvals or sell txns for any of the cleared results.`)) {
                return;
            }
        }

        // send command
        sendCommand(SNIPER_SERVER_URL, 'clearResults', 'sync', {
            mode,
        }, (err, data) => {})
    }

    const handleClearSnipeAttempts = (mode) => {
       window.alert(`Button not enabled!`);
    }

    const handleClearSellAttempts = (mode) => {
        window.alert(`Button not enabled!`);
    }

    // =================================================================================================================
    //
    //  options for select boxes
    //
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

    const gasPriceSettingsOptions = botGasPriceSettings.map((_gasPriceSettings) => {
        return {
            value: _gasPriceSettings.id,
            label: `${_gasPriceSettings.id} - ${_gasPriceSettings.description}`,
        }
    });

    const mevSettingsOptions = botMevSettings.map((_mevSettings) => {
        return {
            value: _mevSettings.id,
            label: `${_mevSettings.id} - ${_mevSettings.description}`,
        }
    });

    const sellTriggerConditionsOptions = botSellTriggerConditions.map((_sellTriggerConditions) => {
        return {
            value: _sellTriggerConditions.id,
            label: `${_sellTriggerConditions.id} - ${_sellTriggerConditions.description}`,
        }
    });

    const snipeTriggerConditionsOptions = botSnipeTriggerConditions.map((_snipeTriggerConditions) => {
        return {
            value: _snipeTriggerConditions.id,
            label: `${_snipeTriggerConditions.id} - ${_snipeTriggerConditions.description}`,
        }
    });

    const swapParamsOptions = botSwapParams.map((_swapParams) => {
        return {
            value: _swapParams.id,
            label: `${_swapParams.id} - ${_swapParams.description}`,
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
            <Header title="AUTOBOT MANAGEMENT" subtitle="Create / edit autobot session settings" />

            <Formik
                onSubmit={()=>{}}
                initialValues={getInitialValues()}
                validationSchema={autobotSettingsSchema}
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
                                label="Autobot Session ID"
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
                                label="Please provide a brief description / name for the Autobot session"
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
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Select Accounts
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
                            useTargetToken={false}
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
                                    <Button color="info" variant="contained" onClick={() => { handleValidateSettings(values) }}>
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

                            <Typography
                                variant="h4"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Controls
                            </Typography>


                            <Box display="flex" mt="10px" p="10px" sx={{
                                gridColumn: "span 4"
                            }}>
                                <Box ml="5px" mr="5px">
                                    <Button color="info" variant="contained" onClick={() => { handleStartSnipeSession(values) }}>
                                        Start
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="info" variant="contained" onClick={() => { handleActivateSnipeSession(values) }}>
                                        Activate
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handlePauseSnipeSession(values) }}>
                                        Pause
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="error" variant="contained" onClick={() => { handleKillSnipeSession(values) }}>
                                        Kill
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleRefreshNonces(values) }}>
                                        Refresh Nonces
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h4"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 1" }}
                            >
                                Pool Info
                            </Typography>

                            <Box display="flex" mt="10px" p="10px" sx={{
                                gridColumn: "span 3"
                            }}>
                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleClearPools('all') }}>
                                        Clear All Pools
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleClearPools('sniped') }}>
                                        Clear Sniped Pools
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleClearPools('non_sniped') }}>
                                        Clear Non-Sniped Pools
                                    </Button>
                                </Box>
                            </Box>

                        </Box>

                            <AutobotPoolsTable></AutobotPoolsTable>

                        <Box
                            display="grid"
                            gap="30px"
                            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                            sx={{
                                "& > div": { gridColumn: isNonMobile ? undefined : "span 4"}
                            }}
                        >
                            <Typography
                                variant="h4"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 1" }}
                            >
                                Results
                            </Typography>

                            <Box display="flex" mt="10px" p="10px" sx={{
                                gridColumn: "span 3"
                            }}>
                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleClearResults('all') }}>
                                        Clear All Results
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleClearResults('sold') }}>
                                        Clear Sold Results
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleClearResults('unsold') }}>
                                        Clear Non-Sold Results
                                    </Button>
                                </Box>
                            </Box>
                        </Box>

                        <AutobotResultsTable></AutobotResultsTable>

                        {/*<Box*/}
                        {/*    display="grid"*/}
                        {/*    gap="30px"*/}
                        {/*    gridTemplateColumns="repeat(4, minmax(0, 1fr))"*/}
                        {/*    sx={{*/}
                        {/*        "& > div": { gridColumn: isNonMobile ? undefined : "span 4"}*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    <Typography*/}
                        {/*        variant="h4"*/}
                        {/*        color="white"*/}
                        {/*        sx={{ m: "15px 0 5px 20px", gridColumn: "span 1" }}*/}
                        {/*    >*/}
                        {/*        Snipe Attempts*/}
                        {/*    </Typography>*/}

                        {/*    <Box display="flex" mt="10px" p="10px" sx={{*/}
                        {/*        gridColumn: "span 3"*/}
                        {/*    }}>*/}
                        {/*        <Box ml="5px" mr="5px">*/}
                        {/*            <Button color="secondary" variant="contained" onClick={() => { handleClearSnipeAttempts('all') }}>*/}
                        {/*                Clear*/}
                        {/*            </Button>*/}
                        {/*        </Box>*/}

                        {/*        <Box ml="5px" mr="5px">*/}
                        {/*            <Button color="secondary" variant="contained" onClick={() => { handleClearSnipeAttempts('failed') }}>*/}
                        {/*                Clear Failed*/}
                        {/*            </Button>*/}
                        {/*        </Box>*/}

                        {/*        <Box ml="5px" mr="5px">*/}
                        {/*            <Button color="secondary" variant="contained" onClick={() => { handleClearSnipeAttempts('all') }}>*/}
                        {/*                Pause*/}
                        {/*            </Button>*/}
                        {/*        </Box>*/}

                        {/*        <Box ml="5px" mr="5px">*/}
                        {/*            <Button color="secondary" variant="contained" onClick={() => { handleClearSnipeAttempts('failed') }}>*/}
                        {/*                Resume*/}
                        {/*            </Button>*/}
                        {/*        </Box>*/}
                        {/*    </Box>*/}
                        {/*</Box>*/}

                        <AutobotSnipeAttemptsTable></AutobotSnipeAttemptsTable>

                        {/*<Box*/}
                        {/*    display="grid"*/}
                        {/*    gap="30px"*/}
                        {/*    gridTemplateColumns="repeat(4, minmax(0, 1fr))"*/}
                        {/*    sx={{*/}
                        {/*        "& > div": { gridColumn: isNonMobile ? undefined : "span 4"}*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    <Typography*/}
                        {/*        variant="h4"*/}
                        {/*        color="white"*/}
                        {/*        sx={{ m: "15px 0 5px 20px", gridColumn: "span 1" }}*/}
                        {/*    >*/}
                        {/*        Sell Attempts*/}
                        {/*    </Typography>*/}

                        {/*    <Box display="flex" mt="10px" p="10px" sx={{*/}
                        {/*        gridColumn: "span 3"*/}
                        {/*    }}>*/}
                        {/*        <Box ml="5px" mr="5px">*/}
                        {/*            <Button color="secondary" variant="contained" onClick={() => { handleClearSellAttempts('all') }}>*/}
                        {/*                Clear*/}
                        {/*            </Button>*/}
                        {/*        </Box>*/}

                        {/*        <Box ml="5px" mr="5px">*/}
                        {/*            <Button color="secondary" variant="contained" onClick={() => { handleClearSellAttempts('failed') }}>*/}
                        {/*                Clear Failed*/}
                        {/*            </Button>*/}
                        {/*        </Box>*/}

                        {/*        <Box ml="5px" mr="5px">*/}
                        {/*            <Button color="secondary" variant="contained" onClick={() => { handleClearSellAttempts('all') }}>*/}
                        {/*                Pause*/}
                        {/*            </Button>*/}
                        {/*        </Box>*/}

                        {/*        <Box ml="5px" mr="5px">*/}
                        {/*            <Button color="secondary" variant="contained" onClick={() => { handleClearSellAttempts('failed') }}>*/}
                        {/*                Resume*/}
                        {/*            </Button>*/}
                        {/*        </Box>*/}
                        {/*    </Box>*/}
                        {/*</Box>*/}

                        <AutobotSellAttemptsTable></AutobotSellAttemptsTable>

                        <Box
                            display="grid"
                            gap="30px"
                            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                            sx={{
                                "& > div": { gridColumn: isNonMobile ? undefined : "span 4"}
                            }}
                        >

                            <Typography
                                variant="h4"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Sniper App Cache
                            </Typography>

                            <Typography
                                variant="h5"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Contracts
                            </Typography>

                            <Box display="flex" mt="10px" p="10px" sx={{
                                gridColumn: "span 4"
                            }}>
                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleViewSniperCache('getRouterCache'); }}>
                                        Routers
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleViewSniperCache('getAnonymousRouterCache'); }}>
                                        Anonymous Routers
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleViewSniperCache('getLiquidityTokenCache'); }}>
                                        Liquidity Tokens
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleViewSniperCache('getTargetTokenCache'); }}>
                                        Target Tokens
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h5"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Liquidity Pools
                            </Typography>

                            <Box display="flex" mt="10px" p="10px" sx={{
                                gridColumn: "span 4"
                            }}>
                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleViewSniperCache('getUniv2NewPoolCache'); }}>
                                        Univ2 Pools
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleViewSniperCache('getUniv3NewPoolCache'); }}>
                                        Univ3 Pools
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h5"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Events
                            </Typography>

                            <Box display="flex" mt="10px" p="10px" sx={{
                                gridColumn: "span 4"
                            }}>
                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleViewSniperCache('getUniv2SwapCache'); }}>
                                        Univ2 Swaps
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleViewSniperCache('getUniv2SyncCache'); }}>
                                        Univ2 Syncs
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleViewSniperCache('getUniv3SwapCache'); }}>
                                        Univ3 Swaps
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleViewSniperCache('getUniv3LiquidityCache'); }}>
                                        Univ3 Liquidity
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h5"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Volume & Liquidity Metrics
                            </Typography>

                            <Box display="flex" mt="10px" p="10px" sx={{
                                gridColumn: "span 4"
                            }}>
                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleViewSniperCache('getUniv2SwapMetricsCache'); }}>
                                        Univ2 Swap Metrics / Volume
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleViewSniperCache('getUniv3SwapMetricsCache'); }}>
                                        Univ3 Swap Metrics / Volume
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleViewSniperCache('getLatestLiquidityMetricsCache'); }}>
                                        Latest Liquidity Metrics
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h5"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Session Results
                            </Typography>

                            <Box display="flex" mt="10px" p="10px" sx={{
                                gridColumn: "span 4"
                            }}>
                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleViewSniperCache('getTargetPoolsCache'); }}>
                                        Target Pools
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleViewSniperCache('getSnipeResultsCache'); }}>
                                        Snipe Results
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleViewSniperCache('getApprovalsCache'); }}>
                                        Approvals
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleViewSniperCache('getSellResultsCache'); }}>
                                        Sell Results
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleViewSniperCache('getTokenBalanceOverridesCache'); }}>
                                        Token Balance Overrides
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </form>
                )}
            </Formik>

            {waiting && (<ProgressWheel />)}

            <Modal
                show={showModal}
                setShow={setShowModal}
                // hideCloseButton
            >
                <ModalHeader>
                    <h2 style={{ color: 'black' }}>Storage</h2>
                </ModalHeader>
                <ModalBody>
                    <p style={{ textAlign: 'justify', color: 'black' }}>
                        {/*Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt maxime dolorem asperiores laboriosam ad delectus ea. Tempora tempore repellendus laudantium fugiat saepe mollitia eius illo possimus laborum consequuntur, tenetur neque.*/}
                        {modalText}
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        </Box>
    );
};

export default Autobot;
