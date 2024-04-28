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
import {sendCommand} from "../../../utils/sendCommand";
import {SNIPER_SERVER_URL} from "../../../utils/constants";
import executorContractSchema from "../../../data/schemas/executorContractSchema";
import Select from "react-select";
import ProgressWheel from "../../../components/ProgressWheel";
import {validateExecutorValues} from "../../../utils/validators/validateExecutorValues";
import defaultAccounts, {ensureDefaultAccounts} from "../../../data/defaults/defaultAccounts";
import {isDescriptionUnique} from "../../../utils/utils";

const initialValues = {
    id: undefined,
    description: "",

    chainId: undefined,

    executorContractAddress: "",
    deployerAddress: "",
    deploymentContractHash: "",
    version: "",

    deployerId: undefined,
    wasDeployed: false,
};

const Executor = () => {
    const componentName = 'Executor';
    const log = (message) => console.log(`[${componentName}] ${message}`);

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { state } = useLocation();

    const {
        loadId,
        loadMode,
        origin,
        originId,
        useChainId,
        mevSettingsOrigin,
    } = (!!state ? state : {});

    const isNonMobile = useMediaQuery("(min-width:600px");
    const navigate = useNavigate();
    const [accounts, setAccounts] = useSessionStorage('accounts', defaultAccounts);
    const [executors, setExecutors] = useSessionStorage('executors', []);
    const [executorEdits, setExecutorEdits] = useSessionStorage('executorEdits', []);
    const [newExecutorEdit, setNewExecutorEdit] = useSessionStorage('newExecutorEdit', undefined);
    let saved = (loadMode && loadMode === 'edit');

    const [waiting, setWaiting] = useState(false);

    if(!accounts || accounts.length === 0) {
        setAccounts(defaultAccounts);
    }

    ensureDefaultAccounts(accounts, setAccounts);

    const getValuesForId = (id) => {
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

    const getEditsForId = (id) => {
        try {
            return executorEdits.filter(o => (
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

    const getAccountForId = (id) => {
        try {
            return accounts.filter(o => (
                o
                && typeof(o.id) !== 'undefined'
                && (o.id === id)
            ))[0];
        } catch(e) {
            log(`Error getting accounts for id`);
            console.log(e);
            return undefined;
        }
    }

    const updateEditForId = (editId, values) => {
        let foundEdit = false;

        try {
            for(let i = 0; i < executorEdits.length; i++) {
                if(executorEdits[i].id === editId) {
                    executorEdits[i] = {...values};
                    foundEdit = true;
                    break;
                }
            }

            if(!foundEdit) {
                executorEdits.push({...values});
            }

            setExecutorEdits(executorEdits);
        } catch(e) {
            log(`Error getting updating edit for id ${editId}`);
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
            setNewExecutorEdit(values);
        }
    }

    const getInitialValues = (_loadId, _loadMode) => {
        try {
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

    const _navigate = (useMevContractId) => {
        if(
            origin && origin.includes('mev-settings')
            || mevSettingsOrigin
        ) {
            navigate(
                '/' + origin,
                {
                    state: {
                        origin: 'executor',
                        loadId: originId,
                        mevSettingsOrigin,
                        useMevContractId,
                    }
                }
            );
        } else {
            navigate('/executors');
        }
    }

    const reloadDeployedExecutor = (id, setFieldValue) => {
        const newExecutor = getValuesForId(id);

        if(!newExecutor) {
            log(`New executor ${id} undefined - cannot update values`);
            return;
        }

        setFieldValue( 'chainId', newExecutor.chainId, false  );
        setFieldValue( 'executorContractAddress', newExecutor.executorContractAddress, false  );
        setFieldValue( 'deployerAddress', newExecutor.deployerAddress, false  );
        setFieldValue( 'deploymentTransactionHash', newExecutor.deploymentTransactionHash, false  );
        setFieldValue( 'version', newExecutor.version, false  );
        setFieldValue( 'deployerId', newExecutor.deployerId, false  );
        setFieldValue( 'wasDeployed', newExecutor.wasDeployed, false  );
        setFieldValue( 'id', newExecutor.id, false  );

    }

    const saveExecutorContract = (values, isFromDeploy, setFieldValue) => {
        let savedId;

        if(!values) {
            log(`Values undefined - cannot save executor`);
            window.alert(`Values undefined - cannot save executor`);
            return;
        }

        const {description} = values;

        if(!description) {
            log(`description undefined - cannot save executor`);
            window.alert(`description undefined - cannot save executor`);
            return;
        }

        const {success, message} = validateExecutorValues(values);

        if(!success) {
            log(`Executor fields failed validation: ${message}`);
            window.alert(`Executor fields failed validation: ${message}`);
            return;
        }

        try {
            if(!values.executorContractAddress) {
                log(`Cannot save executor contract - address undefined`);
                window.alert(`Cannot save executor contract - address undefined`);
                return;
            }

            if(!values.deployerAddress) {
                log(`Cannot save executor contract - deployer address undefined`);
                window.alert(`Cannot save executor contract - deployer address undefined`);
                return;
            }

            if(typeof(values.id) !== 'undefined') {
                console.log(`params have id ${values.id}`);
                let index = -1;

                for(let i = 0; i < executors.length; i++) {
                    const { id } = executors[i];

                    if(values.id === id) {
                        index = i;
                        break;
                    }
                }

                if(index === -1) {
                    // did not find
                    if(!isDescriptionUnique(description, executors || [])) {
                        log(`description must be unique - already have an entry for:\n\n${description}`);
                        window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                        return;
                    }

                    executors.push({...values});
                } else {
                    executors[index] = {...values};
                }

                setExecutors(executors);
                window.alert(`Executor ${values.executorContractAddress} updated at id# ${values.id} with description:\n ${values.description}`);
                saved = true;

                if(isFromDeploy) {
                    reloadDeployedExecutor(savedId, setFieldValue);
                } else {
                    return values.id;
                }
            } else {
                let maxId = -1;

                if(!isDescriptionUnique(description, executors || [])) {
                    log(`description must be unique - already have an entry for:\n\n${description}`);
                    window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                    return;
                }

                for(const item of executors) {
                    if(item && typeof(item.id) !== 'undefined') {
                        if(item.id > maxId) {
                            maxId = item.id;
                        }
                    }
                }

                console.log(`Max id is ${maxId}`);
                const nextId = (typeof(maxId) === 'number') ? maxId + 1 : 1;
                console.log(`Next id is ${nextId}`);

                executors.push({
                    ...values,
                    id: nextId,
                });

                // once validated
                savedId = nextId;
                setExecutors(executors);
                saved = true;
                window.alert(`New executor ${values.executorContractAddress} added at id# ${savedId} with description: \n ${values.description}`);

                if(isFromDeploy) {
                    reloadDeployedExecutor(savedId, setFieldValue);
                } else {
                    return savedId;
                }
            }
        } catch(e) {
            log(`Error saving executor`);
            console.log(e);
            window.alert(`Error saving executor: ${e.toString()}`);
        }
    }

    const handleFormSubmit = (values) => {
        const savedId = saveExecutorContract(values);
        _navigate(savedId);
    }

    const handleCancel = (values) => {
        _navigate(values.id);
    }

    const handleCreateAccount = (values) => {
        log(`Creating new account`);
        saveEdit(values);

        navigate(
            '/account',
            {
                state: {
                    loadMode: 'new',  // mode - indicating to edit existing settings
                    origin: 'executor',  // origin - will return here on save
                    originId: values.id,  // session id to load, upon return, otherwise load from newEdit storage
                    mevSettingsOrigin,
                }
            }
        );
    }

    const handleDeployExecutorContract = (values, setFieldValue) => {
        log(`Deploying new executor contract`);

        try {
            const {
                description,
                deployerId,
                executorContractAddress,
                id,
            } = values;

            if(
                !loadMode
                || loadMode !== 'new'
                || typeof(id) !== 'undefined'
            ) {
                window.alert(`
                Cannot deploy Executor contract - operation not available for existing Executor contracts.
                Use the "NEW" button on the previous screen for adding a new Executor.
            `);
                return;
            }

            if(executorContractAddress) {
                window.alert(`Cannot deploy Executor contract - executor contract address field is not blank`);
                return;
            }

            if(!description) {
                window.alert(`Cannot deploy Executor contract - no description provided`);
                return;
            }

            if(typeof(deployerId) === 'undefined') {
                window.alert(`Cannot deploy Executor contract - no deployer chosen`);
                return;
            }

            const deployer = getAccountForId(deployerId);

            if(!deployer) {
                window.alert(`Cannot deploy Executor contract - deployer account not found for id ${deployerId}`);
                return;
            }

            if(!window.confirm(`Are you sure you would like to deploy a new executor contract using account: ${deployer.address}?`)) {
                return;
            }

            setWaiting(true);

            // send save environment request to sniper app (requires that it is not currently active)
            sendCommand(SNIPER_SERVER_URL, 'deployExecutor', 'async', {
                deployerPrivateKey: deployer.privateKey,
            }, (err, data) => {
                setWaiting(false);

                try {
                    if(err) {
                        // TODO - take no action
                    } else if(!data) {
                        log(`Data undefined in response to deploy new Executor request`);
                        window.alert(`Data undefined in response to deploy new Executor request`);
                    } else {
                        const { success, message, error, contractAddress, ownerAddress, txHash, chainId } = data;

                        if(!success) {
                            const _message = `Sniper app failed to deploy new Executor contract: ${message}`;
                            log(_message);
                            window.alert(_message);
                        } else if(!contractAddress) {
                            const _message = `Contract address undefined in new Executor deployment: ${message}`;
                            log(_message);
                            window.alert(_message);
                        } else if(!ownerAddress) {
                            const _message = `Owner address undefined in new Executor deployment: ${message}`;
                            log(_message);
                            window.alert(_message);
                        } else if(!txHash) {
                            const _message = `Tx hash undefined in new Executor deployment: ${message}`;
                            log(_message);
                            window.alert(_message);
                        } else if(!chainId) {
                            const _message = `Chain ID undefined in new Executor deployment: ${message}`;
                            log(_message);
                            window.alert(_message);
                        } else {
                            saveExecutorContract({
                                description: values.description,
                                chainId,
                                executorContractAddress: contractAddress,
                                deployerAddress: ownerAddress,
                                deploymentTransactionHash: txHash,
                                version: '3.4.0',
                                wasDeployed: true,
                            }, true, setFieldValue);
                        }
                    }
                } catch(e) {
                    log(`Error saving saving new executor after deployment`);
                    console.log(e);
                    window.alert(`Error saving saving new executor after deployment: ${e.toString()}`);
                }
            });
        } catch(e) {
            log(`Error deploying new executor`);
            console.log(e);
            window.alert(`Error sdeploying new executor: ${e.toString()}`);
        }
    }

    const checkIfOperationAllowed = () => {
        if(!saved) {
            log(`Cannot perform operation - contract not saved`);
            window.alert(`Cannot perform operation - contract not saved`);
            return false;
        }

        return true;
    }

    const handleAuthorizeAllAccounts = (values) => {
        log(`Authorizing all accounts for Executor`);
        // authorizeAllAccounts

        if(!checkIfOperationAllowed()) {return;}

        try {
            const {
                description,
                deployerId,
                executorContractAddress,
            } = values;

            if(!description) {
                window.alert(`Cannot authorize all accounts for Executor - no description provided`);
                return;
            }

            if(typeof(deployerId) === 'undefined') {
                window.alert(`Cannot authorize all accounts for Executor - no deployer chosen`);
                return;
            }

            const deployer = getAccountForId(deployerId);

            if(!deployer) {
                window.alert(`Cannot authorize all accounts for Executor - deployer account not found for id ${deployerId}`);
                return;
            }

            if(!executorContractAddress) {
                window.alert(`Cannot authorize all accounts for Executor - executor address undefined`);
                return;
            }

            const mevAuthAddresses = accounts.map(_account => _account.address);

            if(!window.confirm(`Are you sure you would like to authorize all ${mevAuthAddresses.length} addresses to use executor contract ${executorContractAddress}?`)) {
                return;
            }

            setWaiting(true);

            // send save environment request to sniper app (requires that it is not currently active)
            sendCommand(SNIPER_SERVER_URL, 'authorizeAllAccounts', 'async', {
                deployerPrivateKey: deployer.privateKey,
                executorAddress: executorContractAddress,
                mevAuthAddresses,
            }, (err, data) => {
                setWaiting(false);

                if(err) {
                    // TODO - take no action
                } else if(!data) {
                    log(`Data undefined in response to authorize all accounts for Executor request`);
                    window.alert(`Data undefined in response to authorize all accounts for Executor request`);
                } else {
                    const { success, message, error, authResults } = data;

                    if(!success) {
                        const _message = `Sniper app failed to authorize all accounts: ${message}\n${error || ''}`;
                        log(_message);
                        window.alert(_message);
                    } else {
                        let _message = `Authorization for all accounts successful for Executor`;
                        log(_message);
                        window.alert(_message);
                    }
                }
            });
        } catch(e) {
            log(`Error trying to authorize all accounts`);
            console.log(e);
            window.alert(`Error trying to authorize all accounts: ${e.toString()}`);
        }
    }

    const handleAuthorizeAccount = (values) => {
        // authorizeAccount
        log(`Authorizing account for Executor`);
        // authorizeAllAccounts
        if(!checkIfOperationAllowed()) {return;}

        try {
            const {
                description,
                deployerId,
                authorizeAccountAddress,
                executorContractAddress,
            } = values;

            if(!description) {
                window.alert(`Cannot authorize account for Executor - no description provided`);
                return;
            }

            if(typeof(deployerId) === 'undefined') {
                window.alert(`Cannot authorize account for Executor - no deployer chosen`);
                return;
            }

            const deployer = getAccountForId(deployerId);

            if(!deployer) {
                window.alert(`Cannot authorize account for Executor - deployer account not found for id ${deployerId}`);
                return;
            }

            if(!authorizeAccountAddress) {
                window.alert(`Cannot authorize account for Executor - no address provided to authorize`);
                return;
            }

            if(!executorContractAddress) {
                window.alert(`Cannot authorize account for Executor - executor address undefined`);
                return;
            }

            if(!window.confirm(`Are you sure you would like to authorize account ${authorizeAccountAddress} to use executor contract ${executorContractAddress}?`)) {
                return;
            }

            setWaiting(true);

            // send save environment request to sniper app (requires that it is not currently active)
            sendCommand(SNIPER_SERVER_URL, 'authorizeAccount', 'async', {
                deployerPrivateKey: deployer.privateKey,
                authorizeAccountAddress,
                executorAddress: executorContractAddress,
            }, (err, data) => {
                setWaiting(false);

                if(err) {
                    // TODO - take no action
                } else if(!data) {
                    log(`Data undefined in response to authorize account ${authorizeAccountAddress} for Executor request`);
                    window.alert(`Data undefined in response to authorize account ${authorizeAccountAddress} for Executor request`);
                } else {
                    const { success, message, error, txHash } = data;

                    if(!success) {
                        const _message = `Sniper app failed to authorize account ${authorizeAccountAddress}: ${message}\n${error || ''}`;
                        log(_message);
                        window.alert(_message);
                    } else {
                        let _message = `Authorization for account ${authorizeAccountAddress} successful for Executor`;
                        log(_message);
                        window.alert(_message);
                    }
                }
            });
        } catch(e) {
            log(`Error trying to authorize account`);
            console.log(e);
            window.alert(`Error trying to authorize account: ${e.toString()}`);
        }
    }

    const handleWithdrawNativeFunds = (values) => {
        // withdrawNativeFunds
        log(`Withdrawing native funds for Executor`);
        // authorizeAllAccounts
        if(!checkIfOperationAllowed()) {return;}

        try {
            const {
                description,
                deployerId,
                executorContractAddress,
            } = values;

            if(!description) {
                window.alert(`Cannot withdraw native funds for Executor - no description provided`);
                return;
            }

            if(typeof(deployerId) === 'undefined') {
                window.alert(`Cannot withdraw native funds for Executor - no deployer chosen`);
                return;
            }

            const deployer = getAccountForId(deployerId);

            if(!deployer) {
                window.alert(`Cannot withdraw native funds for Executor - deployer account not found for id ${deployerId}`);
                return;
            }

            if(!executorContractAddress) {
                window.alert(`Cannot withdraw native funds for Executor - executor address undefined`);
                return;
            }

            if(!window.confirm(`Are you sure you would like to withdraw native funds from executor contract ${executorContractAddress}?`)) {
                return;
            }

            setWaiting(true);

            // send save environment request to sniper app (requires that it is not currently active)
            sendCommand(SNIPER_SERVER_URL, 'withdrawNativeFunds', 'async', {
                deployerPrivateKey: deployer.privateKey,
                executorAddress: executorContractAddress,
            }, (err, data) => {
                setWaiting(false);

                if(err) {
                    // TODO - take no action
                } else if(!data) {
                    log(`Data undefined in response to withdraw native funds for Executor request`);
                    window.alert(`Data undefined in response to withdraw native funds for Executor request`);
                } else {
                    const { success, message, error, authResults } = data;

                    if(!success) {
                        const _message = `Sniper app failed to withdraw native funds: ${message}\n${error || ''}`;
                        log(_message);
                        window.alert(_message);
                    } else {
                        let _message = `Withdrawal of native funds successful for Executor`;
                        log(_message);
                        window.alert(_message);
                    }
                }
            });
        } catch(e) {
            log(`Error trying to withdraw native funds`);
            console.log(e);
            window.alert(`Error trying to withdraw native funds: ${e.toString()}`);
        }
    }

    const handleWithdrawERC20Tokens = (values) => {
        // withdrawERC20Tokens

        // authorizeAccount
        log(`Authorizing account for Executor`);
        // authorizeAllAccounts
        if(!checkIfOperationAllowed()) {return;}

        try {
            const {
                description,
                deployerId,
                withdrawTokenAddress,
                executorContractAddress,
            } = values;

            if(!description) {
                window.alert(`Cannot withdraw ERC20 tokens for Executor - no description provided`);
                return;
            }

            if(typeof(deployerId) === 'undefined') {
                window.alert(`Cannot withdraw ERC20 tokens for Executor - no deployer chosen`);
                return;
            }

            const deployer = getAccountForId(deployerId);

            if(!deployer) {
                window.alert(`Cannot withdraw ERC20 tokens for Executor - deployer account not found for id ${deployerId}`);
                return;
            }

            if(!withdrawTokenAddress) {
                window.alert(`Cannot withdraw ERC20 tokens for Executor - no token address provided`);
                return;
            }

            if(!executorContractAddress) {
                window.alert(`Cannot withdraw ERC20 tokens for Executor - executor address undefined`);
                return;
            }

            if(!window.confirm(`Are you sure you would like to withdraw token balance for ${withdrawTokenAddress} from executor contract ${executorContractAddress}?`)) {
                return;
            }

            setWaiting(true);

            // send save environment request to sniper app (requires that it is not currently active)
            sendCommand(SNIPER_SERVER_URL, 'withdrawERC20Tokens', 'async', {
                deployerPrivateKey: deployer.privateKey,
                withdrawTokenAddress,
                executorAddress: executorContractAddress,
            }, (err, data) => {
                setWaiting(false);

                if(err) {
                    // TODO - take no action
                } else if(!data) {
                    log(`Data undefined in response to withdraw ERC20 tokens ${withdrawTokenAddress} for Executor request`);
                    window.alert(`Data undefined in response to withdraw ERC20 tokens ${withdrawTokenAddress} for Executor request`);
                } else {
                    const { success, message, error, txHash } = data;

                    if(!success) {
                        const _message = `Sniper app failed to withdraw ERC20 tokens ${withdrawTokenAddress}: ${message}\n${error || ''}`;
                        log(_message);
                        window.alert(_message);
                    } else {
                        let _message = `Withdrawal of ERC20 tokens ${withdrawTokenAddress} successful for Executor`;
                        log(_message);
                        window.alert(_message);
                    }
                }
            });
        } catch(e) {
            log(`Error trying to withdraw ERC20 tokens`);
            console.log(e);
            window.alert(`Error trying to withdraw ERC20 tokens: ${e.toString()}`);
        }
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

    const accountsOptions = accounts.map((_accounts) => {
        return {
            value: _accounts.id,
            label: `${_accounts.id} - ${_accounts.address} - ${_accounts.description}`,
        }
    });

    return(
        <Box m="20px" minHeight="85vh">
            <Header title="EXECUTOR" subtitle="Add / edit / deploy MEV Executor contracts" />

            <Formik
                onSubmit={handleFormSubmit}
                initialValues={getInitialValues(loadId, loadMode)}
                validationSchema={executorContractSchema}
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
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Executor ID"
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
                                label="Please provide a brief description / name for the executor contract"
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

                            {/* TODO - force chainId if provided in routed state */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Chain ID where the Executor is deployed"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.chainId}
                                name="chainId"
                                error={!!touched.chainId && !!errors.chainId}
                                helperText={touched.chainId && errors.chainId}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Executor Contract Address"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.executorContractAddress}
                                name="executorContractAddress"
                                error={!!touched.executorContractAddress && !!errors.executorContractAddress}
                                helperText={touched.executorContractAddress && errors.executorContractAddress}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Owner Address (account that deployed the executor contract - will be verified)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.deployerAddress}
                                name="deployerAddress"
                                error={!!touched.deployerAddress && !!errors.deployerAddress}
                                helperText={touched.deployerAddress && errors.deployerAddress}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Deployment Tx Hash (not necessary, but will be populated by script upon new deployments)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.deploymentTransactionHash}
                                name="deploymentTransactionHash"
                                error={!!touched.deploymentTransactionHash && !!errors.deploymentTransactionHash}
                                helperText={touched.deploymentTransactionHash && errors.deploymentTransactionHash}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Executor Contract Version (not necessary, but will be populated by script upon new deployments)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.version}
                                name="version"
                                error={!!touched.version && !!errors.version}
                                helperText={touched.version && errors.version}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <Box
                                display="flex"
                                justifyContent="left"
                                p="10px"
                                sx={{
                                    gridColumn: "span 4"
                                }}
                            >
                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { saveExecutorContract(values); }}>
                                        Save Executor
                                    </Button>
                                </Box>

                                <Box  ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleFormSubmit(values); }}>
                                        Save Executor and Return
                                    </Button>
                                </Box>

                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleCancel(values); }}>
                                        Cancel
                                    </Button>
                                </Box>
                            </Box>

                            <Box sx={{ gridColumn: "span 4" }}>
                                <Typography
                                    variant="h4"
                                    color={colors.greenAccent[400]}
                                    sx={{ m: "15px 0 5px 20px" }}
                                >
                                    Deploy New Executor Contract
                                </Typography>
                                <Typography
                                    variant="h5"
                                    color="white"
                                    sx={{ m: "15px 0 5px 20px" }}
                                >
                                    Will deploy a new Executor contract to the current environment's given chain ID and populate the above fields with the deployment details.  Can only be used when adding a new Executor.
                                </Typography>
                            </Box>

                            <Typography
                                variant="h5"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 1" }}
                            >
                                Deployer Account
                            </Typography>

                            <FormControl sx={{
                                gridColumn: "span 2"
                            }}>
                                <Select
                                    options={accountsOptions}
                                    name="deployerId"
                                    value={(accountsOptions ? accountsOptions.find(option => option.value === values.deployerId) : '')}
                                    onChange={(option) => { setFieldValue( 'deployerId', option.value, false  ) }}
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
                                    <Button color="secondary" variant="contained" onClick={() => { handleCreateAccount(values) }}>
                                        ADD NEW ACCOUNT
                                    </Button>
                                </Box>
                            </Box>

                            <Box
                                display="flex"
                                justifyContent="left"
                                p="10px"
                                sx={{
                                    gridColumn: "span 4"
                                }}
                            >
                                <Box ml="5px" mr="5px">
                                    <Button color="secondary" variant="contained" onClick={() => { handleDeployExecutorContract(values, setFieldValue); }}>
                                        Deploy Executor
                                    </Button>
                                </Box>
                            </Box>

                            <Box sx={{ gridColumn: "span 4" }}>
                                <Typography
                                    variant="h4"
                                    color={colors.greenAccent[400]}
                                    sx={{ m: "15px 0 5px 20px" }}
                                >
                                    Executor Controls
                                </Typography>
                                <Typography
                                    variant="h5"
                                    color="white"
                                    sx={{ m: "15px 0 5px 20px" }}
                                >
                                    Executor fields must be saved before controls are activated.  Owner must exist in accounts.
                                </Typography>
                            </Box>

                            <Box ml="5px" mr="5px" sx={{ gridColumn: "span 4" }}>
                                <Button color="secondary" variant="contained" onClick={() => { handleAuthorizeAllAccounts(values); }}>
                                    Authorize All Accounts
                                </Button>
                            </Box>

                            <Box ml="5px" mr="5px" sx={{ gridColumn: "span 1" }}>
                                <Button color="secondary" variant="contained" onClick={() => { handleAuthorizeAccount(values); }}>
                                    Authorize Account
                                </Button>
                            </Box>

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Address of account to authorize for Executor"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.authorizeAccountAddress}
                                name="authorizeAccountAddress"
                                error={!!touched.authorizeAccountAddress && !!errors.authorizeAccountAddress}
                                helperText={touched.authorizeAccountAddress && errors.authorizeAccountAddress}
                                sx={{ gridColumn: "span 3" }}
                            />

                            <Box ml="5px" mr="5px" sx={{ gridColumn: "span 4" }}>
                                <Button color="secondary" variant="contained" onClick={() => { handleWithdrawNativeFunds(values); }}>
                                    Withdraw Native Funds (ETH)
                                </Button>
                            </Box>

                            <Box ml="5px" mr="5px" sx={{ gridColumn: "span 1" }}>
                                <Button color="secondary" variant="contained" onClick={() => { handleWithdrawERC20Tokens(values); }}>
                                    Withdraw ERC20 Token Balance
                                </Button>
                            </Box>

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Address of ERC20 token to withdraw"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.withdrawTokenAddress}
                                name="withdrawTokenAddress"
                                error={!!touched.withdrawTokenAddress && !!errors.withdrawTokenAddress}
                                helperText={touched.withdrawTokenAddress && errors.withdrawTokenAddress}
                                sx={{ gridColumn: "span 3" }}
                            />

                        </Box>
                    </form>
                )}
            </Formik>

            {waiting && (<ProgressWheel />)}
        </Box>
    );
}

export default Executor;
