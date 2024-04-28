import {Box, Button, FormControl, FormControlLabel, Switch, TextField, Typography, useTheme} from "@mui/material";
import { Formik } from "formik";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../../components/Header";
import {useLocation, useNavigate} from "react-router-dom";
import useSessionStorage from "../../../utils/useSessionStorage";
import mevSettingsSchema from "../../../data/schemas/mevSettingsSchema";
import {tokens} from "../../../theme";
import React from "react";
import Select from "react-select";
import {validateMevSettings} from "../../../utils/validators/validateMevSettings";
import {isDescriptionUnique, stringify} from "../../../utils/utils";
import {ensureDefaultAccounts} from "../../../data/defaults/defaultAccounts";

const initialValues = {
    id: undefined,
    description: "",

    mevContractId: undefined,
    mevContractAddress: "",
    mevDeployerPrivateKey: "",

    // same block snipe
    useMevWithSameBlockSnipe: false,
    useOnlyMevForSameBlockSnipe: false,
    useSlippageForSameBlockMev: false,
    slippagePercentForMevSameBlockSnipe: "",
    useDifferentTxValueForMevSameBlockSnipe: false,
    txValueForMevSameBlockSnipe: "",
    mevSameBlockSnipeEthAmountForCoinbaseTransfer: "",
    mevSameBlockSnipeNumberOfBlocksToTarget: "",

    // ADDITIONAL BUNDLE
    sendAdditionalMevBundleSameBlockSnipe: false,
    useMevAccount2ForAdditionalBundle: false,
    sendOnlyAdditionalBundleSameBlockSnipe: false,
    useDifferentTxValueForAdditionalBundle: false,
    txValueForAdditionalBundle: "",
    ethAmountForCoinbaseTransferForAdditionalBundle: "",
    numberOfBlocksForAdditionalBundle: "",

    // second block snipe
    useMevWithSecondBlockSnipe: false,
    useOnlyMevForSecondBlockSnipe: false,
    useSlippageForSecondBlockMev: false,
    slippagePercentForMevSecondBlockSnipe: "",
    useMevAccount2ForSecondBlockSnipe: false,
    useDifferentTxValueForMev: false,
    txValueForMev: "",
    mevEthAmountForCoinbaseTransfer: "",
    mevNumberOfBlocksToTarget: "",

    mevAccountPrivateKey: "",
    mevAccount2PrivateKey: "",
};

const MevSettings = () => {
    const componentName = 'MevSettings';
    const log = (message) => console.log(`[${componentName}] ${message}`);


    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { state } = useLocation();

    const {
        loadId,
        loadMode,
        origin,
        originId,
        fwdOrigin,
        mevSettingsOrigin,
        useMevContractId,
    } = (!!state ? state : {});

    const isNonMobile = useMediaQuery("(min-width:600px");
    const navigate = useNavigate();
    const [mevSettings, setMevSettings] = useSessionStorage('mevSettings', []);
    const [executors, setExecutors] = useSessionStorage('executors', []);
    const [mevSettingsEdits, setMevSettingsEdits] = useSessionStorage('mevSettingsEdits', []);
    const [newMevSettingsEdit, setNewMevSettingsEdit] = useSessionStorage('newMevSettingsEdit', undefined);
    const [accounts, setAccounts] = useSessionStorage('accounts', []);

    ensureDefaultAccounts(accounts, setAccounts);

    const _mevSettingsOrigin = (['presets', 'session', 'autobot'].includes(origin)) ? origin : mevSettingsOrigin;

    const getAccountForAddress = (address) => {
        return accounts.filter(o =>
            (
                o
                && address
                && o.address
                && (o.address.toLowerCase() === address.toLowerCase())
            )
        )[0];
    }

    const getExecutorForId = (id) => {
        try {
            return executors.filter(o => (
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

    const getValuesForId = (id) => {
        try {
            return mevSettings.filter(o => (
                o
                && typeof(o.id) !== 'undefined'
                && (o.id === id)
            ))[0];
        } catch(e) {
            log(`Error getting mev settings for id`);
            console.log(e);
            return undefined;
        }
    }

    const getEditsForId = (id) => {
        try {
            return mevSettingsEdits.filter(o => (
                o
                && typeof(o.id) !== 'undefined'
                && (o.id === id)
            ))[0];
        } catch(e) {
            log(`Error getting mev settings edits for id`);
            console.log(e);
            return undefined;
        }
    }

    const updateEditForId = (editId, values) => {
        let foundEdit = false;

        try {
            for(let i = 0; i < mevSettingsEdits.length; i++) {
                if(mevSettingsEdits[i].id === editId) {
                    mevSettingsEdits[i] = {...values};
                    foundEdit = true;
                    break;
                }
            }

            if(!foundEdit) {
                mevSettingsEdits.push({...values});
            }

            setMevSettingsEdits(mevSettingsEdits);
        } catch(e) {
            log(`Error updating mev settings edits for id ${editId}`);
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
            setNewMevSettingsEdit(values);
        }
    }

    // =================================================================================================================
    //
    //  set up / initialize values
    //
    // =================================================================================================================

    const getInitialValues = (_loadId, _loadMode) => {
        try {
            if(origin && origin === 'executor') {
                // returning from editing executor - might be active edit
                if(typeof(_loadId) === 'undefined') {
                    return {
                        ...(newMevSettingsEdit || initialValues),
                        mevContractId: useMevContractId,
                    };
                }

                return {
                    ...(getEditsForId(_loadId) || (getValuesForId(_loadId) || initialValues)),
                    mevContractId: useMevContractId,
                }
            } else {
                // regular load - from presets or session
                if(typeof(_loadId) === 'undefined') {
                    return {...(newMevSettingsEdit || initialValues)};
                }

                return {
                    ...(getValuesForId(_loadId) || initialValues),
                    id: (_loadMode && _loadMode === 'edit') ? _loadId : undefined,
                }
            }
        } catch(e) {
            log(`Error getting initial values`);
            console.log(e);
            return initialValues;
        }

    }

    // =================================================================================================================
    //
    //  handlers
    //
    // =================================================================================================================

    const _navigate = (_id) => {
        const dest = (origin && ['session', 'autobot'].includes(origin))
            ? origin
            : (
                (_mevSettingsOrigin && ['session', 'autobot'].includes(_mevSettingsOrigin))
                    ? _mevSettingsOrigin
                    : undefined
            )

        if(dest) {
            navigate(
                '/' + dest,
                {
                    state: {
                        origin: 'settings',
                        loadId: originId,
                        useMevSettingsId: _id,
                    }
                }
            );
        } else {
            navigate('/mev-settings-presets');
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

        try {
            const executor = getExecutorForId(values.mevContractId);
            const mevContractAddress = executor ? executor.executorContractAddress : undefined;
            const mevDeployerPrivateKey = getAccountForAddress(executor ? executor.deployerAddress : undefined)?.privateKey;

            const { success, message } = validateMevSettings({
                ...values,
                mevContractAddress,
                mevDeployerPrivateKey,
            });

            if(typeof(values.id) !== 'undefined') {
                // console.log(`params have id ${values.id}`);
                let index = -1;

                for(let i = 0; i < mevSettings.length; i++) {
                    const { id } = mevSettings[i];

                    if(values.id === id) {
                        index = i;
                        break;
                    }
                }

                if(index === -1) {
                    // did not find
                    if(!isDescriptionUnique(description, mevSettings || [])) {
                        log(`description must be unique - already have an entry for:\n\n${description}`);
                        window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                        return;
                    }

                    mevSettings.push({ ...values, mevContractAddress, mevDeployerPrivateKey });
                } else {
                    mevSettings[index] = { ...values, mevContractAddress, mevDeployerPrivateKey };
                }
            } else {
                let maxId = -1;

                if(!isDescriptionUnique(description, mevSettings || [])) {
                    log(`description must be unique - already have an entry for:\n\n${description}`);
                    window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                    return;
                }

                for(const item of mevSettings) {
                    if(item && typeof(item.id) !== 'undefined') {
                        if(item.id > maxId) {
                            maxId = item.id;
                        }
                    }
                }

                // console.log(`Max id is ${maxId}`);
                const nextId = (typeof(maxId) === 'number') ? maxId + 1 : 1;
                // console.log(`Next id is ${nextId}`);

                mevSettings.push({
                    ...values,
                    mevContractAddress,
                    mevDeployerPrivateKey,
                    id: nextId,
                });

                savedId = nextId;
                values.id = savedId;
            }

            setMevSettings(mevSettings);
            let useMevSettingsId;

            if(typeof(values.id) !== 'undefined') {
                useMevSettingsId = values.id;

                window.alert(`MEV Settings updated for preset # ${values.id} with description:\n ${values.description} 
                    ${success ? '\nSaved settings: ' + stringify(values) : ('\nWARNING: Settings failed validation: ' + message + '\n\nThey will still be saved, but will not pass validation if sent to sniper app')}
                `);
            } else {
                useMevSettingsId = savedId;

                window.alert(`MEV Settings saved as preset # ${savedId} with description: \n ${values.description} 
                    ${success ? '\nSaved settings: ' + stringify(values) : ('\nWARNING: Settings failed validation: ' + message + '\n\nThey will still be saved, but will not pass validation if sent to sniper app')}
                `);
            }

            return useMevSettingsId;
        } catch(e) {
            log(`Error saving MEV settings`);
            console.log(e);
            window.alert(`Error saving MEV settings: ${e.toString()}`);
            return undefined;
        }
    }

    const handleFormSubmit = (values) => {
        let savedId;

        const useMevSettingsId = handleSave(values);

        if(typeof(useMevSettingsId) !== 'undefined') {
            _navigate(useMevSettingsId);
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

    const handleViewExecutorContract = (mevContractId, values) => {
        log(`Viewing executor at id ${mevContractId}`);
        saveEdit(values);

        navigate(
            '/executor',
            {
                state: {
                    loadId: mevContractId,
                    loadMode: 'edit',
                    origin: 'mev-settings',
                    originId: values.id,
                    mevSettingsOrigin: _mevSettingsOrigin,
                }
            }
        );
    }

    const handleCreateExecutorContract = (values) => {
        log(`Creating new executor`);
        saveEdit(values);

        navigate(
            '/executor',
            {
                state: {
                    loadMode: 'new',
                    origin: 'mev-settings',
                    originId: values.id,
                    mevSettingsOrigin: _mevSettingsOrigin,
                }
            }
        );
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

    const executorsOptions = executors.map((_executors) => {
        return {
            value: _executors.id,
            label: `${_executors.id} - ${_executors.executorContractAddress} - ${_executors.description}`,
        }
    });

    return(
        <Box m="20px" minHeight="85vh">
            <Header title="MEV SETTINGS" subtitle="Create / edit MEV settings preset" />

            <Formik
                onSubmit={handleFormSubmit}
                initialValues={getInitialValues(loadId, loadMode)}
                validationSchema={mevSettingsSchema}
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
                                MEV Executor Contract
                            </Typography>

                            <Typography
                                variant="h5"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 1" }}
                            >
                                Select Executor Contract
                            </Typography>

                            <FormControl sx={{
                                gridColumn: "span 2"
                            }}>
                                <Select
                                    options={executorsOptions}
                                    name="mevContractId"
                                    value={(executorsOptions ? executorsOptions.find(option => option.value === values.mevContractId) : '')}
                                    onChange={(option) => { setFieldValue( 'mevContractId', option.value, false  ) }}
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
                                    <Button color="secondary" variant="contained" onClick={() => { handleViewExecutorContract(values.mevContractId, values) }}>
                                        VIEW
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleCreateExecutorContract(values) }}>
                                        NEW
                                    </Button>
                                </Box>
                            </Box>

                            {/* mevContractAddress */}
                            {/*<TextField*/}
                            {/*    fullWidth*/}
                            {/*    variant="filled"*/}
                            {/*    type="text"*/}
                            {/*    label="MEV Contract Address"*/}
                            {/*    onBlur={handleBlur}*/}
                            {/*    onChange={handleChange}*/}
                            {/*    value={values.mevContractAddress}*/}
                            {/*    name="mevContractAddress"*/}
                            {/*    error={!!touched.mevContractAddress && !!errors.mevContractAddress}*/}
                            {/*    helperText={touched.mevContractAddress && errors.mevContractAddress}*/}
                            {/*    sx={{ gridColumn: "span 4" }}*/}
                            {/*/>*/}

                            {/* mevDeployerPrivateKey */}
                            {/*<TextField*/}
                            {/*    fullWidth*/}
                            {/*    variant="filled"*/}
                            {/*    type="text"*/}
                            {/*    label="MEV Deployer Private Key"*/}
                            {/*    onBlur={handleBlur}*/}
                            {/*    onChange={handleChange}*/}
                            {/*    value={values.mevDeployerPrivateKey}*/}
                            {/*    name="mevDeployerPrivateKey"*/}
                            {/*    error={!!touched.mevDeployerPrivateKey && !!errors.mevDeployerPrivateKey}*/}
                            {/*    helperText={touched.mevDeployerPrivateKey && errors.mevDeployerPrivateKey}*/}
                            {/*    sx={{ gridColumn: "span 4" }}*/}
                            {/*/>*/}

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                MEV Same Block Snipe
                            </Typography>

                            {/* useMevWithSameBlockSnipe */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useMevWithSameBlockSnipe}
                                    onChange={(e) => { setFieldValue( 'useMevWithSameBlockSnipe', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useMevWithSameBlockSnipe"
                                />}
                                label="Use Same Block MEV Snipe"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* useOnlyMevForSameBlockSnipe */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useOnlyMevForSameBlockSnipe}
                                    onChange={(e) => { setFieldValue( 'useOnlyMevForSameBlockSnipe', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useOnlyMevForSameBlockSnipe"
                                />}
                                label="Use Only MEV for Same Bock Snipe"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* useSlippageForSameBlockMev */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useSlippageForSameBlockMev}
                                    onChange={(e) => { setFieldValue( 'useSlippageForSameBlockMev', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useSlippageForSameBlockMev"
                                />}
                                label="Use Slippage for Same Block MEV"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            {/* slippagePercentForMevSameBlockSnipe */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Slippage Percent for Same Block MEV"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.slippagePercentForMevSameBlockSnipe}
                                name="slippagePercentForMevSameBlockSnipe"
                                error={!!touched.slippagePercentForMevSameBlockSnipe && !!errors.slippagePercentForMevSameBlockSnipe}
                                helperText={touched.slippagePercentForMevSameBlockSnipe && errors.slippagePercentForMevSameBlockSnipe}
                                sx={{ gridColumn: "span 3" }}
                            />

                            {/* useDifferentTxValueForMevSameBlockSnipe */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useDifferentTxValueForMevSameBlockSnipe}
                                    onChange={(e) => { setFieldValue( 'useDifferentTxValueForMevSameBlockSnipe', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useDifferentTxValueForMevSameBlockSnipe"
                                />}
                                label="Use Different Tx Value for Same Block Snipe"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            {/* txValueForMevSameBlockSnipe */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Tx Value for Same Block Snipe"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.txValueForMevSameBlockSnipe}
                                name="txValueForMevSameBlockSnipe"
                                error={!!touched.txValueForMevSameBlockSnipe && !!errors.txValueForMevSameBlockSnipe}
                                helperText={touched.txValueForMevSameBlockSnipe && errors.txValueForMevSameBlockSnipe}
                                sx={{ gridColumn: "span 3" }}
                            />

                            {/* mevSameBlockSnipeEthAmountForCoinbaseTransfer */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="ETH Tip Amount for Same Block MEV"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.mevSameBlockSnipeEthAmountForCoinbaseTransfer}
                                name="mevSameBlockSnipeEthAmountForCoinbaseTransfer"
                                error={!!touched.mevSameBlockSnipeEthAmountForCoinbaseTransfer && !!errors.mevSameBlockSnipeEthAmountForCoinbaseTransfer}
                                helperText={touched.mevSameBlockSnipeEthAmountForCoinbaseTransfer && errors.mevSameBlockSnipeEthAmountForCoinbaseTransfer}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* mevSameBlockSnipeNumberOfBlocksToTarget */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Number of Blocks to Target for Same Block MEV"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.mevSameBlockSnipeNumberOfBlocksToTarget}
                                name="mevSameBlockSnipeNumberOfBlocksToTarget"
                                error={!!touched.mevSameBlockSnipeNumberOfBlocksToTarget && !!errors.mevSameBlockSnipeNumberOfBlocksToTarget}
                                helperText={touched.mevSameBlockSnipeNumberOfBlocksToTarget && errors.mevSameBlockSnipeNumberOfBlocksToTarget}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                MEV Same Block Snipe - Non-Positional Bundle
                            </Typography>

                            {/* sendAdditionalMevBundleSameBlockSnipe */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.sendAdditionalMevBundleSameBlockSnipe}
                                    onChange={(e) => { setFieldValue( 'sendAdditionalMevBundleSameBlockSnipe', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="sendAdditionalMevBundleSameBlockSnipe"
                                />}
                                label="Send Non-Positional Bundle for Same Block MEV (requires MEV for same block snipe is enabled above)"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* useMevAccount2ForAdditionalBundle */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useMevAccount2ForAdditionalBundle}
                                    onChange={(e) => { setFieldValue( 'useMevAccount2ForAdditionalBundle', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useMevAccount2ForAdditionalBundle"
                                />}
                                label="Use MEV Account 2 for Non-Positional Bundle"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* sendOnlyAdditionalBundleSameBlockSnipe */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.sendOnlyAdditionalBundleSameBlockSnipe}
                                    onChange={(e) => { setFieldValue( 'sendOnlyAdditionalBundleSameBlockSnipe', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="sendOnlyAdditionalBundleSameBlockSnipe"
                                />}
                                label="Send Only Non-Positional Bundle"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* useDifferentTxValueForAdditionalBundle */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useDifferentTxValueForAdditionalBundle}
                                    onChange={(e) => { setFieldValue( 'useDifferentTxValueForAdditionalBundle', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useDifferentTxValueForAdditionalBundle"
                                />}
                                label="Use Different Tx Value for Non-Positional Bundle"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            {/* txValueForAdditionalBundle */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Tx Value for Non-Positional Bundle"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.txValueForAdditionalBundle}
                                name="txValueForAdditionalBundle"
                                error={!!touched.txValueForAdditionalBundle && !!errors.txValueForAdditionalBundle}
                                helperText={touched.txValueForAdditionalBundle && errors.txValueForAdditionalBundle}
                                sx={{ gridColumn: "span 3" }}
                            />

                            {/* ethAmountForCoinbaseTransferForAdditionalBundle */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="ETH Tip Amount for Non-Positional Bundle"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.ethAmountForCoinbaseTransferForAdditionalBundle}
                                name="ethAmountForCoinbaseTransferForAdditionalBundle"
                                error={!!touched.ethAmountForCoinbaseTransferForAdditionalBundle && !!errors.ethAmountForCoinbaseTransferForAdditionalBundle}
                                helperText={touched.ethAmountForCoinbaseTransferForAdditionalBundle && errors.ethAmountForCoinbaseTransferForAdditionalBundle}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* numberOfBlocksForAdditionalBundle */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Number of Blocks to Target for Non-Positional Bundle"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.numberOfBlocksForAdditionalBundle}
                                name="numberOfBlocksForAdditionalBundle"
                                error={!!touched.numberOfBlocksForAdditionalBundle && !!errors.numberOfBlocksForAdditionalBundle}
                                helperText={touched.numberOfBlocksForAdditionalBundle && errors.numberOfBlocksForAdditionalBundle}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                MEV Second Block Snipe / Gas Estimation / Failsafe
                            </Typography>

                            {/* useMevWithSecondBlockSnipe */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useMevWithSecondBlockSnipe}
                                    onChange={(e) => { setFieldValue( 'useMevWithSecondBlockSnipe', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useMevWithSecondBlockSnipe"
                                />}
                                label="Use MEV for Second Block / Gas Estimation"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* useOnlyMevForSecondBlockSnipe */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useOnlyMevForSecondBlockSnipe}
                                    onChange={(e) => { setFieldValue( 'useOnlyMevForSecondBlockSnipe', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useOnlyMevForSecondBlockSnipe"
                                />}
                                label="Use Only MEV for Second Block / Gas Estimation"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* useSlippageForSecondBlockMev */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useSlippageForSecondBlockMev}
                                    onChange={(e) => { setFieldValue( 'useSlippageForSecondBlockMev', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useSlippageForSecondBlockMev"
                                />}
                                label="Use Slippage for Second Block MEV"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            {/* slippagePercentForMevSecondBlockSnipe */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Slippage Percent for Second Block MEV"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.slippagePercentForMevSecondBlockSnipe}
                                name="slippagePercentForMevSecondBlockSnipe"
                                error={!!touched.slippagePercentForMevSecondBlockSnipe && !!errors.slippagePercentForMevSecondBlockSnipe}
                                helperText={touched.slippagePercentForMevSecondBlockSnipe && errors.slippagePercentForMevSecondBlockSnipe}
                                sx={{ gridColumn: "span 3" }}
                            />

                            {/* useMevAccount2ForSecondBlockSnipe */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useMevAccount2ForSecondBlockSnipe}
                                    onChange={(e) => { setFieldValue( 'useMevAccount2ForSecondBlockSnipe', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useMevAccount2ForSecondBlockSnipe"
                                />}
                                label="Use Acct 2 for Second Block MEV"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* useDifferentTxValueForMev */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useDifferentTxValueForMev}
                                    onChange={(e) => { setFieldValue( 'useDifferentTxValueForMev', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useDifferentTxValueForMev"
                                />}
                                label="Use Different Tx Value for Second Block MEV"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            {/* txValueForMev */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Tx Value for Second Block MEV"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.txValueForMev}
                                name="txValueForMev"
                                error={!!touched.txValueForMev && !!errors.txValueForMev}
                                helperText={touched.txValueForMev && errors.txValueForMev}
                                sx={{ gridColumn: "span 3" }}
                            />

                            {/* mevEthAmountForCoinbaseTransfer */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="ETH Tip Amount for Second Block MEV"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.mevEthAmountForCoinbaseTransfer}
                                name="mevEthAmountForCoinbaseTransfer"
                                error={!!touched.mevEthAmountForCoinbaseTransfer && !!errors.mevEthAmountForCoinbaseTransfer}
                                helperText={touched.mevEthAmountForCoinbaseTransfer && errors.mevEthAmountForCoinbaseTransfer}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* mevNumberOfBlocksToTarget */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Number of Blocks to Target for Second Block MEV"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.mevNumberOfBlocksToTarget}
                                name="mevNumberOfBlocksToTarget"
                                error={!!touched.mevNumberOfBlocksToTarget && !!errors.mevNumberOfBlocksToTarget}
                                helperText={touched.mevNumberOfBlocksToTarget && errors.mevNumberOfBlocksToTarget}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/*<Typography*/}
                            {/*    variant="h4"*/}
                            {/*    color={colors.greenAccent[400]}*/}
                            {/*    sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}*/}
                            {/*>*/}
                            {/*    MEV Accounts*/}
                            {/*</Typography>*/}

                            {/*/!* mevAccountPrivateKey *!/*/}
                            {/*<TextField*/}
                            {/*    fullWidth*/}
                            {/*    variant="filled"*/}
                            {/*    type="text"*/}
                            {/*    label="MEV Account Private Key"*/}
                            {/*    onBlur={handleBlur}*/}
                            {/*    onChange={handleChange}*/}
                            {/*    value={values.mevAccountPrivateKey}*/}
                            {/*    name="mevAccountPrivateKey"*/}
                            {/*    error={!!touched.mevAccountPrivateKey && !!errors.mevAccountPrivateKey}*/}
                            {/*    helperText={touched.mevAccountPrivateKey && errors.mevAccountPrivateKey}*/}
                            {/*    sx={{ gridColumn: "span 4" }}*/}
                            {/*/>*/}

                            {/*/!* mevAccount2PrivateKey *!/*/}
                            {/*<TextField*/}
                            {/*    fullWidth*/}
                            {/*    variant="filled"*/}
                            {/*    type="text"*/}
                            {/*    label="MEV Account 2 Private Key"*/}
                            {/*    onBlur={handleBlur}*/}
                            {/*    onChange={handleChange}*/}
                            {/*    value={values.mevAccount2PrivateKey}*/}
                            {/*    name="mevAccount2PrivateKey"*/}
                            {/*    error={!!touched.mevAccount2PrivateKey && !!errors.mevAccount2PrivateKey}*/}
                            {/*    helperText={touched.mevAccount2PrivateKey && errors.mevAccount2PrivateKey}*/}
                            {/*    sx={{ gridColumn: "span 4" }}*/}
                            {/*/>*/}
                        </Box>
                        <Box display="flex" justifyContent="end" mt="10px" p="10px" sx={{ml: "5px", mr: "5px"}}>
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

export default MevSettings;
