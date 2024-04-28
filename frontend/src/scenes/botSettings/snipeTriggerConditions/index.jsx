import {Box, Button, FormControl, FormControlLabel, Switch, TextField, Typography, useTheme} from "@mui/material";
import { Formik } from "formik";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../../components/Header";
import {useLocation, useNavigate} from "react-router-dom";
import useSessionStorage from "../../../utils/useSessionStorage";
import {tokens} from "../../../theme";
import React from "react";
import {validateSnipeTriggerConditions} from "../../../utils/validators/validateSnipeTriggerConditions";
import {isDescriptionUnique, stringify} from "../../../utils/utils";
import botSnipeTriggerConditionsSchema from "../../../data/schemas/botSnipeTriggerConditionsSchema";

const initialValues = {
    id: undefined,
    description: "",

    // MAX OUTPUT LIMIT FINDER
    maxOutputLimitFinderLowerBounds: "",
    maxOutputLimitFinderUpperBounds: "",
    maxOutputLimitFinderIncrement: "",
    useAutoBoundary: false,

    // LIQUIDITY SETTINGS
    //requireMinimumLiquidity: false,
    minimumLiquidity: "",
    minimumLiquidityETH: "",
    minimumLiquidityWethPools: "",

    // HYPE TOKEN FILTER SETTINGS
    //useHypeTokenFilter: false,
    snipeOnlyHypeTokens: false,
    //hypeTokenUseTxValueFactor: false,
    //hypeTokenTxValueIncreaseFactor: "",
    hypeTokenMaxBlocksToTarget: "",
    hypeTokenMinimumNumberOfSwaps: "",
    hypeTokenMinimumNativeLiquidity: "",
    //hypeTokenMinimumNativeVolume: "",
    hypeTokenMinimumStablecoinLiquidity: "",
    hypeTokenMinimumWethLiquidity: "",
    //hypeTokenMinimumStablecoinVolume: "",

    // DETECT HONEYPOTS
    honeypotDetectionTaxThreshold: "",
    useBuyTaxThreshold: false,
    buyTaxThreshold: "",
    useSellTaxThreshold: false,
    sellTaxThreshold: "",
    // honeypotDetectionTxValue: "",
    // honeypotDetectionAmountIn: "",

    // PREDEFINED TARGET TOKENS SETTINGS
    //filterForPredefinedTokens: false,
    snipeOnlyPredefinedTokens: false,
    pendingPredefinedTargetTokens: '',

    // 1-CLICK PROJECTS
    snipeOnlyOneClickProjects: false,

    // GENERAL BOT SETTINGS

    useMaxPriceImpact: false,
    maxPriceImpactPercent: "",
    maxBlockAgeSeconds: "",
    getBlockLoopIntervalMs: "",
    alertOnlyMode: false,
};

const BotSnipeTriggerConditions = () => {
    const componentName = 'BotSnipeTriggerConditions';
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
    const [botSnipeTriggerConditions, setBotSnipeTriggerConditions] = useSessionStorage('botSnipeTriggerConditions', []);

    const getValuesForId = (id) => {
        try {
            return botSnipeTriggerConditions.filter(o => (
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
            navigate('/bot-snipe-trigger-conditions-presets');
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

                for(let i = 0; i < botSnipeTriggerConditions.length; i++) {
                    const { id } = botSnipeTriggerConditions[i];

                    if(values.id === id) {
                        index = i;
                        break;
                    }
                }

                if(index === -1) {
                    // did not find
                    if(!isDescriptionUnique(description, botSnipeTriggerConditions || [])) {
                        log(`description must be unique - already have an entry for:\n\n${description}`);
                        window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                        return;
                    }

                    botSnipeTriggerConditions.push({...values});
                } else {
                    botSnipeTriggerConditions[index] = {...values};
                }
            } else {
                let maxId = -1;

                if(!isDescriptionUnique(description, botSnipeTriggerConditions || [])) {
                    log(`description must be unique - already have an entry for:\n\n${description}`);
                    window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                    return;
                }

                for(const item of botSnipeTriggerConditions) {
                    if(item && typeof(item.id) !== 'undefined') {
                        if(item.id > maxId) {
                            maxId = item.id;
                        }
                    }
                }

                // console.log(`Max id is ${maxId}`);
                const nextId = (typeof(maxId) === 'number') ? maxId + 1 : 1;
                // console.log(`Next id is ${nextId}`);

                botSnipeTriggerConditions.push({
                    ...values,
                    id: nextId,
                });

                savedId = nextId;
                values.id = savedId;
            }

            setBotSnipeTriggerConditions(botSnipeTriggerConditions);
            let useSnipeTriggerConditionsId;

            if(typeof(values.id) !== 'undefined') {
                useSnipeTriggerConditionsId = values.id;

                window.alert(`Bot Snipe Trigger Conditions updated for preset # ${values.id} with description:\n ${values.description} 
                    ${success ? '\nSaved settings: ' + stringify(values) : ('\n\nWARNING: Settings failed validation: ' + message + '\nThey will still be saved, but will not pass validation if sent to sniper app')}
                `);
            } else {
                useSnipeTriggerConditionsId = savedId;

                window.alert(`Bot Snipe Trigger Conditions saved as preset # ${savedId} with description: \n ${values.description}
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
            <Header title="BOT SNIPE TRIGGER CONDITIONS" subtitle="Create / edit bot snipe trigger conditions preset" />

            <Formik
                onSubmit={handleFormSubmit}
                initialValues={getInitialValues(loadId, loadMode)}
                validationSchema={botSnipeTriggerConditionsSchema}
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

                            {/* MAX OUTPUT LIMIT FINDER */}
                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Max Output Limit Finder
                            </Typography>

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Total Supply Percent Lower Bounds (default 0.09%)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.maxOutputLimitFinderLowerBounds}
                                name="maxOutputLimitFinderLowerBounds"
                                error={!!touched.maxOutputLimitFinderLowerBounds && !!errors.maxOutputLimitFinderLowerBounds}
                                helperText={touched.maxOutputLimitFinderLowerBounds && errors.maxOutputLimitFinderLowerBounds}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Total Supply Percent Upper Bounds (default 2.0%)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.maxOutputLimitFinderUpperBounds}
                                name="maxOutputLimitFinderUpperBounds"
                                error={!!touched.maxOutputLimitFinderUpperBounds && !!errors.maxOutputLimitFinderUpperBounds}
                                helperText={touched.maxOutputLimitFinderUpperBounds && errors.maxOutputLimitFinderUpperBounds}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Total Supply Percent Increment (default 0.1%)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.maxOutputLimitFinderIncrement}
                                name="maxOutputLimitFinderIncrement"
                                error={!!touched.maxOutputLimitFinderIncrement && !!errors.maxOutputLimitFinderIncrement}
                                helperText={touched.maxOutputLimitFinderIncrement && errors.maxOutputLimitFinderIncrement}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useAutoBoundary}
                                    onChange={(e) => { setFieldValue( 'useAutoBoundary', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useAutoBoundary"
                                />}
                                label="Use Auto-Boundary for Limit Finder -> sets upper bounds to quoted amount for given tx value, sets lower bounds and icrement to 5% of this value"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* LIQUIDITY SETTINGS */}
                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Minimum Liquidity
                            </Typography>

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Minimum Liquidity for Native Currency-base pools - value in ETH (native currency)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.minimumLiquidityETH}
                                name="minimumLiquidityETH"
                                error={!!touched.minimumLiquidityETH && !!errors.minimumLiquidityETH}
                                helperText={touched.minimumLiquidityETH && errors.minimumLiquidityETH}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Minimum Liquidity for Stablecoin-base pools - value in US Dollars"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.minimumLiquidity}
                                name="minimumLiquidity"
                                error={!!touched.minimumLiquidity && !!errors.minimumLiquidity}
                                helperText={touched.minimumLiquidity && errors.minimumLiquidity}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Minimum Liquidity for WETH-base pools for networks with their own native currency - value in ETH"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.minimumLiquidityWethPools}
                                name="minimumLiquidityWethPools"
                                error={!!touched.minimumLiquidityWethPools && !!errors.minimumLiquidityWethPools}
                                helperText={touched.minimumLiquidityWethPools && errors.minimumLiquidityWethPools}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/*/!* PREDEFINED TARGET TOKENS SETTINGS *!/*/}
                            {/*<Typography*/}
                            {/*    variant="h4"*/}
                            {/*    color={colors.greenAccent[400]}*/}
                            {/*    sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}*/}
                            {/*>*/}
                            {/*    Predefined Target Tokens*/}
                            {/*</Typography>*/}

                            {/*<FormControlLabel*/}
                            {/*    // fullWidth*/}
                            {/*    variant="filled"*/}
                            {/*    // type="text"*/}
                            {/*    control={ <Switch*/}
                            {/*        checked={values.snipeOnlyPredefinedTokens}*/}
                            {/*        onChange={(e) => { setFieldValue( 'snipeOnlyPredefinedTokens', e.target.checked, false  ) }}*/}
                            {/*        color="secondary"*/}
                            {/*        name="snipeOnlyPredefinedTokens"*/}
                            {/*    />}*/}
                            {/*    label="Snipe Only Predefined Target Tokens - token addresses will be added in the controls section of an Autobot Session"*/}
                            {/*    //value={values.autoApproveRouter}*/}
                            {/*    // error={!!touched.useMevExecutor && !!errors.useMevExecutor}*/}
                            {/*    // helperText={touched.useMevExecutor && errors.useMevExecutor}*/}
                            {/*    sx={{ gridColumn: "span 4" }}*/}
                            {/*/>*/}

                            {/* HYPE TOKEN FILTER SETTINGS */}
                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Hype Token Filters
                            </Typography>

                            {/*<FormControlLabel*/}
                            {/*    // fullWidth*/}
                            {/*    variant="filled"*/}
                            {/*    // type="text"*/}
                            {/*    control={ <Switch*/}
                            {/*        checked={values.useHypeTokenFilter}*/}
                            {/*        onChange={(e) => { setFieldValue( 'useHypeTokenFilter', e.target.checked, false  ) }}*/}
                            {/*        color="secondary"*/}
                            {/*        name="useHypeTokenFilter"*/}
                            {/*    />}*/}
                            {/*    label="Filter for Hype Tokens"*/}
                            {/*    //value={values.autoApproveRouter}*/}
                            {/*    // error={!!touched.useMevExecutor && !!errors.useMevExecutor}*/}
                            {/*    // helperText={touched.useMevExecutor && errors.useMevExecutor}*/}
                            {/*    sx={{ gridColumn: "span 4" }}*/}
                            {/*/>*/}

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.snipeOnlyHypeTokens}
                                    onChange={(e) => { setFieldValue( 'snipeOnlyHypeTokens', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="snipeOnlyHypeTokens"
                                />}
                                label="Snipe Only Hype Tokens - only tokens will be sniped that meet the below thresholds"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Total number of blocks to summarize for hype token thresholds"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.hypeTokenMaxBlocksToTarget}
                                name="hypeTokenMaxBlocksToTarget"
                                error={!!touched.hypeTokenMaxBlocksToTarget && !!errors.hypeTokenMaxBlocksToTarget}
                                helperText={touched.hypeTokenMaxBlocksToTarget && errors.hypeTokenMaxBlocksToTarget}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Minimum number of swaps for hype token threshold"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.hypeTokenMinimumNumberOfSwaps}
                                name="hypeTokenMinimumNumberOfSwaps"
                                error={!!touched.hypeTokenMinimumNumberOfSwaps && !!errors.hypeTokenMinimumNumberOfSwaps}
                                helperText={touched.hypeTokenMinimumNumberOfSwaps && errors.hypeTokenMinimumNumberOfSwaps}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Minimum namount of liquidity for Native Currency-base pools - value in ETH (native currency)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.hypeTokenMinimumNativeLiquidity}
                                name="hypeTokenMinimumNativeLiquidity"
                                error={!!touched.hypeTokenMinimumNativeLiquidity && !!errors.hypeTokenMinimumNativeLiquidity}
                                helperText={touched.hypeTokenMinimumNativeLiquidity && errors.hypeTokenMinimumNativeLiquidity}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Minimum namount of liquidity for Stablecoin-base pools - value in US Dollars"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.hypeTokenMinimumStablecoinLiquidity}
                                name="hypeTokenMinimumStablecoinLiquidity"
                                error={!!touched.hypeTokenMinimumStablecoinLiquidity && !!errors.hypeTokenMinimumStablecoinLiquidity}
                                helperText={touched.hypeTokenMinimumStablecoinLiquidity && errors.hypeTokenMinimumStablecoinLiquidity}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Minimum namount of liquidity for WETH-base pools on networks with their own native currency - value in ETH"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.hypeTokenMinimumWethLiquidity}
                                name="hypeTokenMinimumWethLiquidity"
                                error={!!touched.hypeTokenMinimumWethLiquidity && !!errors.hypeTokenMinimumWethLiquidity}
                                helperText={touched.hypeTokenMinimumWethLiquidity && errors.hypeTokenMinimumWethLiquidity}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* 1-CLICK PROJECT */}
                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                1-Click Project Sniping
                            </Typography>

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.snipeOnlyOneClickProjects}
                                    onChange={(e) => { setFieldValue( 'snipeOnlyOneClickProjects', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="snipeOnlyOneClickProjects"
                                />}
                                label="Snipe 1-Click Projects - will only snipe projects where the token is deployed in the same TX as add-liquidity"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* HONEYPOT DETECTOR SETTINGS */}
                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                HP Detector
                            </Typography>

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Total Tax Threshold"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.honeypotDetectionTaxThreshold}
                                name="honeypotDetectionTaxThreshold"
                                error={!!touched.honeypotDetectionTaxThreshold && !!errors.honeypotDetectionTaxThreshold}
                                helperText={touched.honeypotDetectionTaxThreshold && errors.honeypotDetectionTaxThreshold}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useBuyTaxThreshold}
                                    onChange={(e) => { setFieldValue( 'useBuyTaxThreshold', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useBuyTaxThreshold"
                                />}
                                label="Use BUY Tax Threshold"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="BUY Tax Threshold"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.buyTaxThreshold}
                                name="buyTaxThreshold"
                                error={!!touched.buyTaxThreshold && !!errors.buyTaxThreshold}
                                helperText={touched.buyTaxThreshold && errors.buyTaxThreshold}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useSellTaxThreshold}
                                    onChange={(e) => { setFieldValue( 'useSellTaxThreshold', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useSellTaxThreshold"
                                />}
                                label="Use SELL Tax Threshold"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="SELL Tax Threshold"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.sellTaxThreshold}
                                name="sellTaxThreshold"
                                error={!!touched.sellTaxThreshold && !!errors.sellTaxThreshold}
                                helperText={touched.sellTaxThreshold && errors.sellTaxThreshold}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Max Block Delay For Sells - will check if selling is possible up to the next N blocks"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.maxBlockDelayForSells}
                                name="maxBlockDelayForSells"
                                error={!!touched.maxBlockDelayForSells && !!errors.maxBlockDelayForSells}
                                helperText={touched.maxBlockDelayForSells && errors.maxBlockDelayForSells}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* PRICE IMPACT */}

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Price Impact
                            </Typography>

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
                                label="Use Max Price Impact"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Max Price Impact Percent(%)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.maxPriceImpactPercent}
                                name="maxPriceImpactPercent"
                                error={!!touched.maxPriceImpactPercent && !!errors.maxPriceImpactPercent}
                                helperText={touched.maxPriceImpactPercent && errors.maxPriceImpactPercent}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* GENERAL BOT SETTINGS */}

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                General Bot Settings
                            </Typography>

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Max Block Age (seconds) - blocks received that are older will be ignored"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.maxBlockAgeSeconds}
                                name="maxBlockAgeSeconds"
                                error={!!touched.maxBlockAgeSeconds && !!errors.maxBlockAgeSeconds}
                                helperText={touched.maxBlockAgeSeconds && errors.maxBlockAgeSeconds}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Get-Block Loop Interval (ms) - when only using HTTPS,this will be the amount of time to wait between checming for new blocks"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.getBlockLoopIntervalMs}
                                name="getBlockLoopIntervalMs"
                                error={!!touched.getBlockLoopIntervalMs && !!errors.getBlockLoopIntervalMs}
                                helperText={touched.getBlockLoopIntervalMs && errors.getBlockLoopIntervalMs}
                                sx={{ gridColumn: "span 4" }}
                            />

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
                                label="USE ALERT ONLY MODE - NO SNIPES WILL BE SENT"
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

export default BotSnipeTriggerConditions;
