import {Box, Button, FormControl, FormControlLabel, Switch, TextField, Typography, useTheme} from "@mui/material";
import { Formik } from "formik";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../../components/Header";
import snipeTriggerConditionsSchema from "../../../data/schemas/snipeTriggerConditionsSchema";
import {useLocation, useNavigate} from "react-router-dom";
import useSessionStorage from "../../../utils/useSessionStorage";
import {tokens} from "../../../theme";
import React from "react";
import Select from "react-select";
import {validateSnipeTriggerConditions} from "../../../utils/validators/validateSnipeTriggerConditions";
import {isDescriptionUnique, stringify} from "../../../utils/utils";

const initialValues = {
    id: undefined,
    description: "",

    // TARGET BLOCK
    useTargetBlock: false,
    targetBlockNumber: "",

    // BLOCK TIMESTAMP
    useBlockTimestamp: false,
    blockTimestamp: "",

    // BLOCK SPAMMER
    useBlockSpammer: false,
    blockSpammerStart: "",
    blockSpammerEnd: "",
    usePreSignedTransactions: false,
    useSecondaryBlockStream: false,
    useRetriesForNonceTooHighError: false,

    // LIQUIDITY TRANSACTION TRIGGERS
    detectLiquidityTransaction: false,

    // LIQUIDITY TRANSACTION TRIGGER MODES
    useSameBlockSnipe: false,
    detectPendingEnableTradingTxns: false,
    dontMatchGweiForSameBlockSnipe: false,
    useSameBlockFailsafeEstimateGas: false,
    useSecondBlockSnipe: false,
    waitForBlockConfirmationsLiquidity: false,
    numberOfConfirmationsLiquidity: "",

    // LIQUIDITY TRANSACTION TRIGGER FILTERS
    matchSenderAddress: false,
    senderAddress: "",
    requireMinimumLiquidity: false,
    minimumLiquidity: "",
    minimumLiquidityETH: "",
    minimumLiquidityTargetToken: "",

    // SPECIFIC TARGET TRANSACTION TRIGGERS
    useTriggerTransaction: false,

    // SPECIFIC TARGET TRANSACTION TRIGGER FILTERS
    matchSenderAddressTarget: false,
    senderAddressTarget: "",
    matchContractAddress: false,
    contractAddress: "",
    matchInputField: false,
    inputField: "",

    // SPECIFIC TARGET TRANSACTION TRIGGER MODES
    useSameBlockSnipeTarget: false,
    dontMatchGweiForSameBlockSnipeTarget: false,
    // useSameBlockFailsafeTarget: false,
    useSameBlockFailsafeEstimateGasTarget: false,
    useSecondBlockSnipeTarget: false,
    waitForBlockConfirmationsTarget: false,
    numberOfConfirmationsTarget: "",

    // PERSISTENT SPAM
    usePersistentSpam: false,
    persistentSpamTargetSenderAddress: "",
    persistentSpamGasEstimationFailsafe: false,

    // ADDITIONAL TRIGGER TYPES
    estimateGas: false,
    // amountInForEthCall: "",
    // txValueForEthCall: "",
    waitForBlockConfirmationsEstimateGas: false,
    numberOfConfirmationsEstimateGas: "",

    // PERSISTENT SIMULATION
    usePersistentSimulation: false,
    dontMatchGweiForSameBlockSnipePersistentSimulation: false,

    useGetPair: false,
    useGetReserves: false,
    reservesMinimumLiquidity: "",
    reservesMinimumLiquidityETH: "",
    reservesMinimumLiquidityTargetToken: "",

    // ADDITIONAL SNIPER OPTIONS
    sendOutputTokensToSender: false,
    blockTriggers: false,
    requireAll: false,
    alertOnlyMode: false,

    // PRIVATE TXNS
    useOnlyPrivateTransactionsForSameBlockSnipes: false,
    useOnlyPrivateTransactions: false,

    // PRICE IMPACT
    useMaxPriceImpact: false,
    // keepCheckingPriceImpact: false,
    maxPriceImpactPercent: "",

    // PRICE LIMIT
    usePriceLimit: false,
    // keepCheckingPriceLimit: false,
    maxPricePerToken: "",

    // DETECT HONEYPOTS
    detectHoneypot: false,
    detectPendingHp: false,
    honeypotDetectorSimulationType: "simulate_buy_and_sell",
    useTotalTaxThresholdForHoneypot: false,
    useSpecificBuyTaxThresholdForHoneypot: false,
    useSpecificSellTaxThresholdForHoneypot: false,
    honeypotDetectionTaxThreshold: "",
    honeypotDetectionBuyTaxThreshold: "",
    honeypotDetectionSellTaxThreshold: "",
    hpDetectorMaxBlockDelayForSells: "",
    // honeypotDetectionTxValue: "",
    // honeypotDetectionAmountIn: "",

    // MAX OUTPUT LIMIT FINDER
    useMaxOutputLimitFinder: false,
    useMaxOutputLimitFinderGasEstimation: false,
    useMaxOutputLimitFinderPersistentSimulation: false,
    useMaxOutputLimitFinderPending: false,
    maxOutputLimitFinderLowerBounds: "",
    maxOutputLimitFinderUpperBounds: "",
    maxOutputLimitFinderIncrement: "",
    // maxOutputLimitFinderEthAmount: "",
};

const SnipeTriggerConditions = () => {
    const componentName = 'SnipeTriggerConditions';
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
    const [snipeTriggerConditions, setSnipeTriggerConditions] = useSessionStorage('snipeTriggerConditions', []);

    const getValuesForId = (id) => {
        try {
            return snipeTriggerConditions.filter(o => (
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
        if(origin && ['session', 'autobot'].includes(origin)) {
            navigate(
                '/' + origin,
                {
                    state: {
                        origin: 'settings',
                        loadId: originId,
                        useSnipeTriggerConditionsId: _id,
                    }
                }
            );
        } else {
            navigate('/snipe-trigger-conditions-presets');
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

        const {success, message} = validateSnipeTriggerConditions(values);

        try {
            if(typeof(values.id) !== 'undefined') {
                // console.log(`params have id ${values.id}`);
                let index = -1;

                for(let i = 0; i < snipeTriggerConditions.length; i++) {
                    const { id } = snipeTriggerConditions[i];

                    if(values.id === id) {
                        index = i;
                        break;
                    }
                }

                if(index === -1) {
                    // did not find
                    if(!isDescriptionUnique(description, snipeTriggerConditions || [])) {
                        log(`description must be unique - already have an entry for:\n\n${description}`);
                        window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                        return;
                    }

                    snipeTriggerConditions.push({...values});
                } else {
                    snipeTriggerConditions[index] = {...values};
                }
            } else {
                let maxId = -1;

                if(!isDescriptionUnique(description, snipeTriggerConditions || [])) {
                    log(`description must be unique - already have an entry for:\n\n${description}`);
                    window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                    return;
                }

                for(const item of snipeTriggerConditions) {
                    if(item && typeof(item.id) !== 'undefined') {
                        if(item.id > maxId) {
                            maxId = item.id;
                        }
                    }
                }

                // console.log(`Max id is ${maxId}`);
                const nextId = (typeof(maxId) === 'number') ? maxId + 1 : 1;
                // console.log(`Next id is ${nextId}`);

                snipeTriggerConditions.push({
                    ...values,
                    id: nextId,
                });

                savedId = nextId;
                values.id = savedId;
            }

            setSnipeTriggerConditions(snipeTriggerConditions);
            let useSnipeTriggerConditionsId;

            if(typeof(values.id) !== 'undefined') {
                useSnipeTriggerConditionsId = values.id;

                window.alert(`Snipe Trigger Conditions updated for preset # ${values.id} with description:\n ${values.description} 
                    ${success ? '\nSaved settings: ' + stringify(values) : ('\n\nWARNING: Settings failed validation: ' + message + '\nThey will still be saved, but will not pass validation if sent to sniper app')}
                `);
            } else {
                useSnipeTriggerConditionsId = savedId;

                window.alert(`Snipe Trigger Conditions saved as preset # ${savedId} with description: \n ${values.description}
                    ${success ? '\nSaved settings: ' + stringify(values) : ('\n\nWARNING: Settings failed validation: ' + message + '\nThey will still be saved, but will not pass validation if sent to sniper app')}
                `);
            }

            return useSnipeTriggerConditionsId;
        } catch(e) {
            log(`Error saving snipe trigger settings`);
            console.log(e);
            window.alert(`Error saving snipe trigger settings: ${e.toString()}`);
            return undefined;
        }
    }

    const handleFormSubmit = (values) => {
        let savedId;

        const useSnipeTriggerConditionsId = handleSave(values);

        if(typeof(useSnipeTriggerConditionsId) !== 'undefined') {
            _navigate(useSnipeTriggerConditionsId);
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

    const hpDetectorSimTypeSelectOptions = [
        { value: 'simulate_buy_only', label: 'Simulate Buy Only' },
        { value: 'simulate_buy_and_sell', label: 'Simulate Buy and Sell' },
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

    return(
        <Box m="20px">
            <Header title="SNIPE TRIGGER CONDITIONS" subtitle="Create / edit snipe trigger conditions preset" />

            <Formik
                onSubmit={handleFormSubmit}
                initialValues={getInitialValues(loadId, loadMode)}
                validationSchema={snipeTriggerConditionsSchema}
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

                            {/* TARGET BLOCK */}
                            {/* useTargetBlock */}
                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Condition 0 - Target Block Trigger
                            </Typography>

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useTargetBlock}
                                    onChange={(e) => { setFieldValue( 'useTargetBlock', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useTargetBlock"
                                />}
                                label="Use Target Block Number Trigger"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            {/* targetBlockNumber */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Target Block Number"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.targetBlockNumber}
                                name="targetBlockNumber"
                                error={!!touched.targetBlockNumber && !!errors.targetBlockNumber}
                                helperText={touched.targetBlockNumber && errors.targetBlockNumber}
                                sx={{ gridColumn: "span 3" }}
                            />

                            {/* BLOCK TIMESTAMP */}
                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Condition 1 - Target Block Timestamp Trigger
                            </Typography>

                            {/* useBlockTimestamp */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useBlockTimestamp}
                                    onChange={(e) => { setFieldValue( 'useBlockTimestamp', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useBlockTimestamp"
                                />}
                                label="Use Block Timestamp Trigger"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            {/* blockTimestamp */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Target Block Timestamp"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.blockTimestamp}
                                name="blockTimestamp"
                                error={!!touched.blockTimestamp && !!errors.blockTimestamp}
                                helperText={touched.blockTimestamp && errors.blockTimestamp}
                                sx={{ gridColumn: "span 3" }}
                            />

                            {/* BLOCK SPAMMER */}
                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Condition 2 - Block Spammer
                            </Typography>
                            {/* useBlockSpammer */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useBlockSpammer}
                                    onChange={(e) => { setFieldValue( 'useBlockSpammer', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useBlockSpammer"
                                />}
                                label="Use Block Spammer"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* blockSpammerStart */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Block Spammer Start Timestamp"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.blockSpammerStart}
                                name="blockSpammerStart"
                                error={!!touched.blockSpammerStart && !!errors.blockSpammerStart}
                                helperText={touched.blockSpammerStart && errors.blockSpammerStart}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* blockSpammerEnd */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Block Spammer End Timestamp"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.blockSpammerEnd}
                                name="blockSpammerEnd"
                                error={!!touched.blockSpammerEnd && !!errors.blockSpammerEnd}
                                helperText={touched.blockSpammerEnd && errors.blockSpammerEnd}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* usePreSignedTransactions */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.usePreSignedTransactions}
                                    onChange={(e) => { setFieldValue( 'usePreSignedTransactions', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="usePreSignedTransactions"
                                />}
                                label="Use Pre-Signed Txns for Block Spammer"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* useSecondaryBlockStream */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useSecondaryBlockStream}
                                    onChange={(e) => { setFieldValue( 'useSecondaryBlockStream', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useSecondaryBlockStream"
                                />}
                                label="Use Secondary Block Stream - Only Available for Arbitrum (uses our node)"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* useRetriesForNonceTooHighError */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useRetriesForNonceTooHighError}
                                    onChange={(e) => { setFieldValue( 'useRetriesForNonceTooHighError', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useRetriesForNonceTooHighError"
                                />}
                                label="Use Retries for Nonce Too High Error - Only Available for Arbitrum When Using Pre-Signed Txns"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* LIQUIDITY TRANSACTION TRIGGERS */}
                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Condition 3 - Detection of Liquidity / Enable Trading Transactions
                            </Typography>
                            {/* detectLiquidityTransaction */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.detectLiquidityTransaction}
                                    onChange={(e) => { setFieldValue( 'detectLiquidityTransaction', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="detectLiquidityTransaction"
                                />}
                                label="Use Liquidty Transaction Triggers"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* LIQUIDITY TRANSACTION TRIGGER MODES */}
                            {/* useSameBlockSnipe */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useSameBlockSnipe}
                                    onChange={(e) => { setFieldValue( 'useSameBlockSnipe', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useSameBlockSnipe"
                                />}
                                label="Use Same Block Snipe for Liquidity Tx Trigger (snipes will be triggered by liquidity txns detected in mempool)"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* detectPendingEnableTradingTxns */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.detectPendingEnableTradingTxns}
                                    onChange={(e) => { setFieldValue( 'detectPendingEnableTradingTxns', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="detectPendingEnableTradingTxns"
                                />}
                                label="Detect Pending Enable Trading / Internal Add Liquidity Txns"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* dontMatchGweiForSameBlockSnipe */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.dontMatchGweiForSameBlockSnipe}
                                    onChange={(e) => { setFieldValue( 'dontMatchGweiForSameBlockSnipe', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="dontMatchGweiForSameBlockSnipe"
                                />}
                                label="Don't Match Gas Price of Pending Liquidity / Enable Trading Txns"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* useSameBlockFailsafeEstimateGas */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useSameBlockFailsafeEstimateGas}
                                    onChange={(e) => { setFieldValue( 'useSameBlockFailsafeEstimateGas', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useSameBlockFailsafeEstimateGas"
                                />}
                                label="Use Gas Estimation Failsafe for Same Block Snipes"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* useSecondBlockSnipe */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useSecondBlockSnipe}
                                    onChange={(e) => { setFieldValue( 'useSecondBlockSnipe', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useSecondBlockSnipe"
                                />}
                                label="Use Second Block Snipe Trigger (when liquidity txn detected in block txns)"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* waitForBlockConfirmationsLiquidity */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.waitForBlockConfirmationsLiquidity}
                                    onChange={(e) => { setFieldValue( 'waitForBlockConfirmationsLiquidity', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="waitForBlockConfirmationsLiquidity"
                                />}
                                label="Wait a Specific Number of Blocks After Liquidity Tx is Confirmed"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            {/* numberOfConfirmationsLiquidity */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Number of Blocks to Wait"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.numberOfConfirmationsLiquidity}
                                name="numberOfConfirmationsLiquidity"
                                error={!!touched.numberOfConfirmationsLiquidity && !!errors.numberOfConfirmationsLiquidity}
                                helperText={touched.numberOfConfirmationsLiquidity && errors.numberOfConfirmationsLiquidity}
                                sx={{ gridColumn: "span 3" }}
                            />

                            {/* LIQUIDITY TRANSACTION TRIGGER FILTERS */}
                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Condition 4 - Detection of Target Transactions with Specific Fields
                            </Typography>
                            {/* matchSenderAddress */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.matchSenderAddress}
                                    onChange={(e) => { setFieldValue( 'matchSenderAddress', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="matchSenderAddress"
                                />}
                                label="Match Sender Address in Liquidity / Enable Trading Tx"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            {/* senderAddress */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Sender Address for Liquidity / Enable Trading Tx"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.senderAddress}
                                name="senderAddress"
                                error={!!touched.senderAddress && !!errors.senderAddress}
                                helperText={touched.senderAddress && errors.senderAddress}
                                sx={{ gridColumn: "span 3" }}
                            />

                            {/* requireMinimumLiquidity */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.requireMinimumLiquidity}
                                    onChange={(e) => { setFieldValue( 'requireMinimumLiquidity', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="requireMinimumLiquidity"
                                />}
                                label="Require Minimum Liquidity in Add Liquidity Trading Tx"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* minimumLiquidity */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Minimum Token Liquidity (for ERC20 Base Token Liquidity)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.minimumLiquidity}
                                name="minimumLiquidity"
                                error={!!touched.minimumLiquidity && !!errors.minimumLiquidity}
                                helperText={touched.minimumLiquidity && errors.minimumLiquidity}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* minimumLiquidityETH */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Minimum ETH/Native Liquidity (for WETH Base Token Liquidity)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.minimumLiquidityETH}
                                name="minimumLiquidityETH"
                                error={!!touched.minimumLiquidityETH && !!errors.minimumLiquidityETH}
                                helperText={touched.minimumLiquidityETH && errors.minimumLiquidityETH}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* minimumLiquidityTargetToken */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Minimum Target Token Liquidity"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.minimumLiquidityTargetToken}
                                name="minimumLiquidityTargetToken"
                                error={!!touched.minimumLiquidityTargetToken && !!errors.minimumLiquidityTargetToken}
                                helperText={touched.minimumLiquidityTargetToken && errors.minimumLiquidityTargetToken}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* SPECIFIC TARGET TRANSACTION TRIGGERS */}
                            {/* useTriggerTransaction */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useTriggerTransaction}
                                    onChange={(e) => { setFieldValue( 'useTriggerTransaction', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useTriggerTransaction"
                                />}
                                label="Use Specific Target Transaction Trigger"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* SPECIFIC TARGET TRANSACTION TRIGGER FILTERS */}
                            {/* matchSenderAddressTarget */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.matchSenderAddressTarget}
                                    onChange={(e) => { setFieldValue( 'matchSenderAddressTarget', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="matchSenderAddressTarget"
                                />}
                                label="Match Sender Address in Target Transaction"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            {/* senderAddressTarget */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Sender Address for Target Transaction"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.senderAddressTarget}
                                name="senderAddressTarget"
                                error={!!touched.senderAddressTarget && !!errors.senderAddressTarget}
                                helperText={touched.senderAddressTarget && errors.senderAddressTarget}
                                sx={{ gridColumn: "span 3" }}
                            />

                            {/* matchContractAddress */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.matchContractAddress}
                                    onChange={(e) => { setFieldValue( 'matchContractAddress', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="matchContractAddress"
                                />}
                                label="Match Contract Address for Target Transaction"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            {/* contractAddress */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Contract Address for Target Transaction"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.contractAddress}
                                name="contractAddress"
                                error={!!touched.contractAddress && !!errors.contractAddress}
                                helperText={touched.contractAddress && errors.contractAddress}
                                sx={{ gridColumn: "span 3" }}
                            />

                            {/* matchInputField */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.matchInputField}
                                    onChange={(e) => { setFieldValue( 'matchInputField', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="matchInputField"
                                />}
                                label="Match Input Field for Target Transaction"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            {/* inputField */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Input Field for Target Transaction"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.inputField}
                                name="inputField"
                                error={!!touched.inputField && !!errors.inputField}
                                helperText={touched.inputField && errors.inputField}
                                sx={{ gridColumn: "span 3" }}
                            />

                            {/* SPECIFIC TARGET TRANSACTION TRIGGER MODES */}
                            {/* useSameBlockSnipeTarget */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useSameBlockSnipeTarget}
                                    onChange={(e) => { setFieldValue( 'useSameBlockSnipeTarget', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useSameBlockSnipeTarget"
                                />}
                                label="Use Same Block Snipe for Target Transaction"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* dontMatchGweiForSameBlockSnipeTarget */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.dontMatchGweiForSameBlockSnipeTarget}
                                    onChange={(e) => { setFieldValue( 'dontMatchGweiForSameBlockSnipeTarget', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="dontMatchGweiForSameBlockSnipeTarget"
                                />}
                                label="Don't Match Gas Price of Pending Target Tx"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* useSameBlockFailsafeEstimateGasTarget */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useSameBlockFailsafeEstimateGasTarget}
                                    onChange={(e) => { setFieldValue( 'useSameBlockFailsafeEstimateGasTarget', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useSameBlockFailsafeEstimateGasTarget"
                                />}
                                label="Use Gas Estimation Failsafe for Target Transaction"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* useSecondBlockSnipeTarget */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useSecondBlockSnipeTarget}
                                    onChange={(e) => { setFieldValue( 'useSecondBlockSnipeTarget', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useSecondBlockSnipeTarget"
                                />}
                                label="Use Second Block Snipe for Target Tx (when Target tx is confirmed in Block txns)"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* waitForBlockConfirmationsTarget */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.waitForBlockConfirmationsTarget}
                                    onChange={(e) => { setFieldValue( 'waitForBlockConfirmationsTarget', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="waitForBlockConfirmationsTarget"
                                />}
                                label="Wait a Specific Number of Blocks After Target Txn is Confirmed"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            {/* numberOfConfirmationsTarget */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Number of Blocks to Wait"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.numberOfConfirmationsTarget}
                                name="numberOfConfirmationsTarget"
                                error={!!touched.numberOfConfirmationsTarget && !!errors.numberOfConfirmationsTarget}
                                helperText={touched.numberOfConfirmationsTarget && errors.numberOfConfirmationsTarget}
                                sx={{ gridColumn: "span 3" }}
                            />

                            {/* PERSISTENT SPAM */}
                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Condition 5 - Persistent Spam
                            </Typography>
                            {/* usePersistentSpam */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.usePersistentSpam}
                                    onChange={(e) => { setFieldValue( 'usePersistentSpam', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="usePersistentSpam"
                                />}
                                label="Use Persistent Spam"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* persistentSpamTargetSenderAddress */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Target Sender Address for Persisten Spam"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.persistentSpamTargetSenderAddress}
                                name="persistentSpamTargetSenderAddress"
                                error={!!touched.persistentSpamTargetSenderAddress && !!errors.persistentSpamTargetSenderAddress}
                                helperText={touched.persistentSpamTargetSenderAddress && errors.persistentSpamTargetSenderAddress}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* persistentSpamGasEstimationFailsafe */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.persistentSpamGasEstimationFailsafe}
                                    onChange={(e) => { setFieldValue( 'persistentSpamGasEstimationFailsafe', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="persistentSpamGasEstimationFailsafe"
                                />}
                                label="Use Gas Estimation Failsafe for Persistent Spam"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* ADDITIONAL TRIGGER TYPES */}
                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Condition 6 - Estimate Gas
                            </Typography>
                            {/* estimateGas */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.estimateGas}
                                    onChange={(e) => { setFieldValue( 'estimateGas', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="estimateGas"
                                />}
                                label="Use Gas Estimation Trigger (Simulates snipe with eth_call on each new block)"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* waitForBlockConfirmationsEstimateGas */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.waitForBlockConfirmationsEstimateGas}
                                    onChange={(e) => { setFieldValue( 'waitForBlockConfirmationsEstimateGas', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="waitForBlockConfirmationsEstimateGas"
                                />}
                                label="Wait a Specific Number of Blocks After Gas Estimation Succeeds"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            {/* numberOfConfirmationsEstimateGas */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Number of Blocks to Wait"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.numberOfConfirmationsEstimateGas}
                                name="numberOfConfirmationsEstimateGas"
                                error={!!touched.numberOfConfirmationsEstimateGas && !!errors.numberOfConfirmationsEstimateGas}
                                helperText={touched.numberOfConfirmationsEstimateGas && errors.numberOfConfirmationsEstimateGas}
                                sx={{ gridColumn: "span 3" }}
                            />

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Condition 7 - Get-Pair Trigger
                            </Typography>

                            {/* useGetPair */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useGetPair}
                                    onChange={(e) => { setFieldValue( 'useGetPair', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useGetPair"
                                />}
                                label="Use Get-Pair Trigger"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Condition 8 - Get-Reserves Trigger
                            </Typography>

                            {/* useGetReserves */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useGetReserves}
                                    onChange={(e) => { setFieldValue( 'useGetReserves', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useGetReserves"
                                />}
                                label="Use Get-Reserves Trigger"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* reservesMinimumLiquidity */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Minimum Token Liquidity Amount for Get-Reserves (For ERC20 Base Token Liquidity)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.reservesMinimumLiquidity}
                                name="reservesMinimumLiquidity"
                                error={!!touched.reservesMinimumLiquidity && !!errors.reservesMinimumLiquidity}
                                helperText={touched.reservesMinimumLiquidity && errors.reservesMinimumLiquidity}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* reservesMinimumLiquidityETH */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Minimum WETH/Native Liquidity Amount for Get-Reserves (For WETH Base Token Liquidity)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.reservesMinimumLiquidityETH}
                                name="reservesMinimumLiquidityETH"
                                error={!!touched.reservesMinimumLiquidityETH && !!errors.reservesMinimumLiquidityETH}
                                helperText={touched.reservesMinimumLiquidityETH && errors.reservesMinimumLiquidityETH}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* reservesMinimumLiquidityTargetToken */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Minimum Target Token Liquidity for Get-Reserves"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.reservesMinimumLiquidityTargetToken}
                                name="reservesMinimumLiquidityTargetToken"
                                error={!!touched.reservesMinimumLiquidityTargetToken && !!errors.reservesMinimumLiquidityTargetToken}
                                helperText={touched.reservesMinimumLiquidityTargetToken && errors.reservesMinimumLiquidityTargetToken}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* PERSISTENT SIMULATION */}
                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Condition 9 - Persistent Simulation
                            </Typography>
                            {/* usePersistentSimulation */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.usePersistentSimulation}
                                    onChange={(e) => { setFieldValue( 'usePersistentSimulation', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="usePersistentSimulation"
                                />}
                                label="Use Persistent Simulation (not enabled)"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* dontMatchGweiForSameBlockSnipePersistentSimulation */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.dontMatchGweiForSameBlockSnipePersistentSimulation}
                                    onChange={(e) => { setFieldValue( 'dontMatchGweiForSameBlockSnipePersistentSimulation', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="dontMatchGweiForSameBlockSnipePersistentSimulation"
                                />}
                                label="Don't Match Gas Price of Pending Txns for Persistent Simulation"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Additional Snipe Conditions - will apply to the chosen trigger condition(s)
                            </Typography>

                            <Typography
                                variant="h5"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Max Price Impact
                            </Typography>

                            {/* PRICE IMPACT */}
                            {/* useMaxPriceImpact */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useMaxPriceImpact}
                                    onChange={(e) => { setFieldValue( 'useMaxPriceImpact', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useMaxPriceImpact"
                                />}
                                label="Use Max Price Impact Condition"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            {/* maxPriceImpactPercent */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Max Price Impact Percent"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.maxPriceImpactPercent}
                                name="maxPriceImpactPercent"
                                error={!!touched.maxPriceImpactPercent && !!errors.maxPriceImpactPercent}
                                helperText={touched.maxPriceImpactPercent && errors.maxPriceImpactPercent}
                                sx={{ gridColumn: "span 3" }}
                            />

                            {/* PRICE LIMIT */}

                            <Typography
                                variant="h5"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Max Price Per Token
                            </Typography>

                            {/* usePriceLimit */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.usePriceLimit}
                                    onChange={(e) => { setFieldValue( 'usePriceLimit', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="usePriceLimit"
                                />}
                                label="Use Price Limit Condition"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            {/* maxPricePerToken */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Max Price Per Token (in USD)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.maxPricePerToken}
                                name="maxPricePerToken"
                                error={!!touched.maxPricePerToken && !!errors.maxPricePerToken}
                                helperText={touched.maxPricePerToken && errors.maxPricePerToken}
                                sx={{ gridColumn: "span 3" }}
                            />

                            {/* DETECT HONEYPOTS */}
                            <Typography
                                variant="h5"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                HoneyPot Detection
                            </Typography>
                            {/* detectHoneypot */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.detectHoneypot}
                                    onChange={(e) => { setFieldValue( 'detectHoneypot', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="detectHoneypot"
                                />}
                                label="Detect HoneyPots"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* detectPendingHp */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.detectPendingHp}
                                    onChange={(e) => { setFieldValue( 'detectPendingHp', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="detectPendingHp"
                                />}
                                label="Detect HoneyPots for Same Block Snipe"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* TODO - make this a select box */}
                            {/* honeypotDetectorSimulationType */}
                            {/*<TextField*/}
                            {/*    fullWidth*/}
                            {/*    variant="filled"*/}
                            {/*    type="text"*/}
                            {/*    label="HP Detector Simulation Type"*/}
                            {/*    onBlur={handleBlur}*/}
                            {/*    onChange={handleChange}*/}
                            {/*    value={values.honeypotDetectorSimulationType}*/}
                            {/*    name="honeypotDetectorSimulationType"*/}
                            {/*    error={!!touched.honeypotDetectorSimulationType && !!errors.honeypotDetectorSimulationType}*/}
                            {/*    helperText={touched.honeypotDetectorSimulationType && errors.honeypotDetectorSimulationType}*/}
                            {/*    sx={{ gridColumn: "span 4" }}*/}
                            {/*/>*/}

                            {/*<Typography*/}
                            {/*    variant="h4"*/}
                            {/*    color={colors.greenAccent[400]}*/}
                            {/*    sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}*/}
                            {/*>*/}
                            {/*    Transaction Type*/}
                            {/*</Typography>*/}

                            <FormControl sx={{
                                gridColumn: "span 4"
                            }}>
                                <Select
                                    options={hpDetectorSimTypeSelectOptions}
                                    name="honeypotDetectorSimulationType"
                                    value={(hpDetectorSimTypeSelectOptions ? hpDetectorSimTypeSelectOptions.find(option => option.value === values.honeypotDetectorSimulationType) : '')}
                                    onChange={(option) => { setFieldValue( 'honeypotDetectorSimulationType', option.value, false  ) }}
                                    onBlur={handleBlur}
                                    styles={customStyles}
                                />
                            </FormControl>

                            {/* useTotalTaxThresholdForHoneypot */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useTotalTaxThresholdForHoneypot}
                                    onChange={(e) => { setFieldValue( 'useTotalTaxThresholdForHoneypot', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useTotalTaxThresholdForHoneypot"
                                />}
                                label="Use Total Tax Threshold for HP Detector"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            {/* honeypotDetectionTaxThreshold */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="TOTAL Tax Threshold for HP Detector"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.honeypotDetectionTaxThreshold}
                                name="honeypotDetectionTaxThreshold"
                                error={!!touched.honeypotDetectionTaxThreshold && !!errors.honeypotDetectionTaxThreshold}
                                helperText={touched.honeypotDetectionTaxThreshold && errors.honeypotDetectionTaxThreshold}
                                sx={{ gridColumn: "span 3" }}
                            />

                            {/* useSpecificBuyTaxThresholdForHoneypot */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useSpecificBuyTaxThresholdForHoneypot}
                                    onChange={(e) => { setFieldValue( 'useSpecificBuyTaxThresholdForHoneypot', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useSpecificBuyTaxThresholdForHoneypot"
                                />}
                                label="Use Specific BUY Tax Threshold for HP Detector"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            {/* honeypotDetectionBuyTaxThreshold */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="BUY Tax Threshold for HP Detector"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.honeypotDetectionBuyTaxThreshold}
                                name="honeypotDetectionBuyTaxThreshold"
                                error={!!touched.honeypotDetectionBuyTaxThreshold && !!errors.honeypotDetectionBuyTaxThreshold}
                                helperText={touched.honeypotDetectionBuyTaxThreshold && errors.honeypotDetectionBuyTaxThreshold}
                                sx={{ gridColumn: "span 3" }}
                            />

                            {/* useSpecificSellTaxThresholdForHoneypot */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useSpecificSellTaxThresholdForHoneypot}
                                    onChange={(e) => { setFieldValue( 'useSpecificSellTaxThresholdForHoneypot', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useSpecificSellTaxThresholdForHoneypot"
                                />}
                                label="Use Specific SELL Tax Threshold for HP Detector"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            {/* honeypotDetectionSellTaxThreshold */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="SELL Tax Threshold for HP Detector"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.honeypotDetectionSellTaxThreshold}
                                name="honeypotDetectionSellTaxThreshold"
                                error={!!touched.honeypotDetectionSellTaxThreshold && !!errors.honeypotDetectionSellTaxThreshold}
                                helperText={touched.honeypotDetectionSellTaxThreshold && errors.honeypotDetectionSellTaxThreshold}
                                sx={{ gridColumn: "span 3" }}
                            />

                            {/* hpDetectorMaxBlockDelayForSells */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Max Block Delay Between BUY and SELL"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.hpDetectorMaxBlockDelayForSells}
                                name="hpDetectorMaxBlockDelayForSells"
                                error={!!touched.hpDetectorMaxBlockDelayForSells && !!errors.hpDetectorMaxBlockDelayForSells}
                                helperText={touched.hpDetectorMaxBlockDelayForSells && errors.hpDetectorMaxBlockDelayForSells}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* MAX OUTPUT LIMIT FINDER */}
                            <Typography
                                variant="h5"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                               Max Output Limit Finder
                            </Typography>
                            {/* useMaxOutputLimitFinder */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useMaxOutputLimitFinder}
                                    onChange={(e) => { setFieldValue( 'useMaxOutputLimitFinder', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useMaxOutputLimitFinder"
                                />}
                                label="Use Max Output Limit Finder"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* useMaxOutputLimitFinderGasEstimation */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useMaxOutputLimitFinderGasEstimation}
                                    onChange={(e) => { setFieldValue( 'useMaxOutputLimitFinderGasEstimation', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useMaxOutputLimitFinderGasEstimation"
                                />}
                                label="Use Max Output Limit Finder for Gas Estimation"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* useMaxOutputLimitFinderPersistentSimulation */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useMaxOutputLimitFinderPersistentSimulation}
                                    onChange={(e) => { setFieldValue( 'useMaxOutputLimitFinderPersistentSimulation', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useMaxOutputLimitFinderPersistentSimulation"
                                />}
                                label="Use Max Output Limit Finder for Persistent Simulation"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* useMaxOutputLimitFinderPending */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useMaxOutputLimitFinderPending}
                                    onChange={(e) => { setFieldValue( 'useMaxOutputLimitFinderPending', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useMaxOutputLimitFinderPending"
                                />}
                                label="Use Max Output Limit Finder for Same Block Snipes"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* maxOutputLimitFinderLowerBounds */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Total Supply % Lower Bounds for Limit Finder"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.maxOutputLimitFinderLowerBounds}
                                name="maxOutputLimitFinderLowerBounds"
                                error={!!touched.maxOutputLimitFinderLowerBounds && !!errors.maxOutputLimitFinderLowerBounds}
                                helperText={touched.maxOutputLimitFinderLowerBounds && errors.maxOutputLimitFinderLowerBounds}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* maxOutputLimitFinderUpperBounds */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Total Supply % Upper Bounds for Limit Finder"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.maxOutputLimitFinderUpperBounds}
                                name="maxOutputLimitFinderUpperBounds"
                                error={!!touched.maxOutputLimitFinderUpperBounds && !!errors.maxOutputLimitFinderUpperBounds}
                                helperText={touched.maxOutputLimitFinderUpperBounds && errors.maxOutputLimitFinderUpperBounds}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* maxOutputLimitFinderIncrement */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Total Supply % Increment for Limit Finder"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.maxOutputLimitFinderIncrement}
                                name="maxOutputLimitFinderIncrement"
                                error={!!touched.maxOutputLimitFinderIncrement && !!errors.maxOutputLimitFinderIncrement}
                                helperText={touched.maxOutputLimitFinderIncrement && errors.maxOutputLimitFinderIncrement}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* ADDITIONAL SNIPER OPTIONS */}
                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Additional Sniper Options
                            </Typography>

                            {/* sendOutputTokensToSender */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.sendOutputTokensToSender}
                                    onChange={(e) => { setFieldValue( 'sendOutputTokensToSender', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="sendOutputTokensToSender"
                                />}
                                label="Send Output Tokens Back to Swarm Acct"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* blockTriggers */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.blockTriggers}
                                    onChange={(e) => { setFieldValue( 'blockTriggers', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="blockTriggers"
                                />}
                                label="Block Other Conditions Once First Condition is Triggered"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* requireAll */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.requireAll}
                                    onChange={(e) => { setFieldValue( 'requireAll', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="requireAll"
                                />}
                                label="Require All Conditions to Pass Before Triggering Snipe"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* alertOnlyMode */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.alertOnlyMode}
                                    onChange={(e) => { setFieldValue( 'alertOnlyMode', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="alertOnlyMode"
                                />}
                                label="Use Alert-Only Mode - No Snipes Will Be Sent"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* PRIVATE TXNS */}
                            {/* useOnlyPrivateTransactionsForSameBlockSnipes */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useOnlyPrivateTransactionsForSameBlockSnipes}
                                    onChange={(e) => { setFieldValue( 'useOnlyPrivateTransactionsForSameBlockSnipes', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useOnlyPrivateTransactionsForSameBlockSnipes"
                                />}
                                label="Use Only Private Txns for Same Block Snipes"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* useOnlyPrivateTransactions */}
                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useOnlyPrivateTransactions}
                                    onChange={(e) => { setFieldValue( 'useOnlyPrivateTransactions', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useOnlyPrivateTransactions"
                                />}
                                label="Use Only Private Txns for Second Block Snipes"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />
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

export default SnipeTriggerConditions;
