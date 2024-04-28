import {Box, Button, FormControlLabel, Switch, TextField, Typography, useTheme} from "@mui/material";
import { Formik } from "formik";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../../components/Header";
import {useLocation, useNavigate} from "react-router-dom";
import useSessionStorage from "../../../utils/useSessionStorage";
import {tokens} from "../../../theme";
import React from "react";
import {validateSellTriggerConditions} from "../../../utils/validators/validateSellTriggerConditions";
import {isDescriptionUnique, stringify} from "../../../utils/utils";
import botSellTriggerConditionsSchema from "../../../data/schemas/botSellTriggerConditionsSchema";

const initialValues = {
    id: undefined,
    description: "",

    //autoApproveRouter: true,

    // DUMP STALE TOKENS

    dumpStaleTokens: false,
    dumpStaleTokensNumberOfBlocks: "",

    dumpStaleTokensAtPriceTarget: false,
    priceTargetForDumpStaleTokens: "",
    numberOfBlocksForDumpStaleTokensAtPriceTarget: "",

    // HP ACTIVATION

    //sellAtTargetRoi: false,
    sellsTargetRoi: "",
    sellsMaxPercentToSwapBack: "",

    frontunRemoveLiquidityTxn: false,
    minimumLiquidityPercentForSell: "",

    frontrunHpActivationTxn: false,
    hpActivationSellTaxThreshold: "",
    useBlockDelayForSimulatingSells: false,
    hpActivationBlockDelay: "",
};

const BotSellTriggerConditions = () => {
    const componentName = 'BotSellTriggerConditions';
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
    const [botSellTriggerConditions, setBotSellTriggerConditions] = useSessionStorage('botSellTriggerConditions', []);

    const getValuesForId = (id) => {
        try {
            return botSellTriggerConditions.filter(o => (
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
                        useSellTriggerConditionsId: _id,
                    }
                }
            );
        } else {
            navigate('/bot-sell-trigger-conditions-presets');
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

        const {success, message} = validateSellTriggerConditions(values);

        try {
            if(typeof(values.id) !== 'undefined') {
                // console.log(`params have id ${values.id}`);
                let index = -1;

                for(let i = 0; i < botSellTriggerConditions.length; i++) {
                    const { id } = botSellTriggerConditions[i];

                    if(values.id === id) {
                        index = i;
                        break;
                    }
                }

                if(index === -1) {
                    // did not find
                    if(!isDescriptionUnique(description, botSellTriggerConditions || [])) {
                        log(`description must be unique - already have an entry for:\n\n${description}`);
                        window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                        return;
                    }

                    botSellTriggerConditions.push({...values});
                } else {
                    botSellTriggerConditions[index] = {...values};
                }
            } else {
                let maxId = -1;

                if(!isDescriptionUnique(description, botSellTriggerConditions || [])) {
                    log(`description must be unique - already have an entry for:\n\n${description}`);
                    window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                    return;
                }

                for(const item of botSellTriggerConditions) {
                    if(item && typeof(item.id) !== 'undefined') {
                        if(item.id > maxId) {
                            maxId = item.id;
                        }
                    }
                }

                // console.log(`Max id is ${maxId}`);
                const nextId = (typeof(maxId) === 'number') ? maxId + 1 : 1;
                // console.log(`Next id is ${nextId}`);

                botSellTriggerConditions.push({
                    ...values,
                    id: nextId,
                });

                savedId = nextId;
                values.id = savedId;
            }

            setBotSellTriggerConditions(botSellTriggerConditions);
            let useSellTriggerConditionsId;

            if(typeof(values.id) !== 'undefined') {
                useSellTriggerConditionsId = values.id;

                window.alert(`Bot Sell Trigger Conditions updated for preset # ${values.id} with description:\n ${values.description} 
                    ${success ? '\nSaved settings: ' + stringify(values) : ('\n\nWARNING: Settings failed validation: ' + message + '\nThey will still be saved, but will not pass validation if sent to sniper app')}
                `);
            } else {
                useSellTriggerConditionsId = savedId;

                window.alert(`Bot Sell Trigger Conditions saved as preset # ${savedId} with description: \n ${values.description}
                    ${success ? '\nSaved settings: ' + stringify(values) : ('\n\nWARNING: Settings failed validation: ' + message + '\nThey will still be saved, but will not pass validation if sent to sniper app')}
                `);
            }

            return useSellTriggerConditionsId;
        } catch(e) {
            log(`Error saving sell trigger settings`);
            console.log(e);
            window.alert(`Error saving sell trigger settings: ${e.toString()}`);
            return undefined;
        }
    }

    const handleFormSubmit = (values) => {
        let savedId;

        const useSellTriggerConditionsId = handleSave(values);

        if(typeof(useSellTriggerConditionsId) !== 'undefined') {
            _navigate(useSellTriggerConditionsId);
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

    return(
        <Box m="20px" minHeight="85vh">
            <Header title="BOT SELL TRIGGER CONDITIONS" subtitle="Create / edit bot sell trigger conditions preset" />

            <Formik
                onSubmit={handleFormSubmit}
                initialValues={getInitialValues(loadId, loadMode)}
                validationSchema={botSellTriggerConditionsSchema}
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

                            {/* autoApproveRouter */}
                            {/*<FormControlLabel*/}
                            {/*    // fullWidth*/}
                            {/*    variant="filled"*/}
                            {/*    // type="text"*/}
                            {/*    control={ <Switch*/}
                            {/*        checked={values.autoApproveRouter}*/}
                            {/*        onChange={(e) => { setFieldValue( 'autoApproveRouter', e.target.checked, false  ) }}*/}
                            {/*        color="secondary"*/}
                            {/*        name="autoApproveRouter"*/}
                            {/*    />}*/}
                            {/*    label="Auto-Approve Router Once Snipe Successful"*/}
                            {/*    //value={values.autoApproveRouter}*/}
                            {/*    // error={!!touched.useMevExecutor && !!errors.useMevExecutor}*/}
                            {/*    // helperText={touched.useMevExecutor && errors.useMevExecutor}*/}
                            {/*    sx={{ gridColumn: "span 4" }}*/}
                            {/*/>*/}

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Dumping Stale Tokens
                            </Typography>

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.dumpStaleTokens}
                                    onChange={(e) => { setFieldValue( 'dumpStaleTokens', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="dumpStaleTokens"
                                />}
                                label="Dump stale tokens after a given number of blocks if price target not met"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />


                            {/* dumpStaleTokensNumberOfBlocks */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Amount of blocks to wait before dumping stale tokens"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.dumpStaleTokensNumberOfBlocks}
                                name="dumpStaleTokensNumberOfBlocks"
                                error={!!touched.dumpStaleTokensNumberOfBlocks && !!errors.dumpStaleTokensNumberOfBlocks}
                                helperText={touched.dumpStaleTokensNumberOfBlocks && errors.dumpStaleTokensNumberOfBlocks}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Dumping Stale Tokens at Price Target
                            </Typography>

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.dumpStaleTokensAtPriceTarget}
                                    onChange={(e) => { setFieldValue( 'dumpStaleTokensAtPriceTarget', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="dumpStaleTokensAtPriceTarget"
                                />}
                                label="Dump stale tokens after a given number of blocks if price falls below the target"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />


                            {/* dumpStaleTokensNumberOfBlocks */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Price target for dumping stale tokens"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.priceTargetForDumpStaleTokens}
                                name="priceTargetForDumpStaleTokens"
                                error={!!touched.priceTargetForDumpStaleTokens && !!errors.priceTargetForDumpStaleTokens}
                                helperText={touched.priceTargetForDumpStaleTokens && errors.priceTargetForDumpStaleTokens}
                                sx={{ gridColumn: "span 4" }}
                            />

                            {/* dumpStaleTokensNumberOfBlocks */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Amount of blocks to wait before dumping stale tokens at price target"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.numberOfBlocksForDumpStaleTokensAtPriceTarget}
                                name="numberOfBlocksForDumpStaleTokensAtPriceTarget"
                                error={!!touched.numberOfBlocksForDumpStaleTokensAtPriceTarget && !!errors.numberOfBlocksForDumpStaleTokensAtPriceTarget}
                                helperText={touched.numberOfBlocksForDumpStaleTokensAtPriceTarget && errors.numberOfBlocksForDumpStaleTokensAtPriceTarget}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Price Targets
                            </Typography>

                            {/* targetPriceGain */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Target Price Gain for Selling Tokens (example 1.5)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.sellsTargetRoi}
                                name="sellsTargetRoi"
                                error={!!touched.sellsTargetRoi && !!errors.sellsTargetRoi}
                                helperText={touched.sellsTargetRoi && errors.sellsTargetRoi}
                                sx={{ gridColumn: "span 3" }}
                            />

                            {/* sellsMaxPercentToSwapBack */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Percent of Tokens to Sell at Target Price Gain"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.sellsMaxPercentToSwapBack}
                                name="sellsMaxPercentToSwapBack"
                                error={!!touched.sellsMaxPercentToSwapBack && !!errors.sellsMaxPercentToSwapBack}
                                helperText={touched.sellsMaxPercentToSwapBack && errors.sellsMaxPercentToSwapBack}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Front-Running Remove Liquidity Txns
                            </Typography>

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.frontunRemoveLiquidityTxn}
                                    onChange={(e) => { setFieldValue( 'frontunRemoveLiquidityTxn', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="frontunRemoveLiquidityTxn"
                                />}
                                label="Frontrun Remove Liquidity Transactions"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />


                            {/* dumpStaleTokensNumberOfBlocks */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Minimum % of Liquidity Removal to Trigger Sell"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.minimumLiquidityPercentForSell}
                                name="minimumLiquidityPercentForSell"
                                error={!!touched.minimumLiquidityPercentForSell && !!errors.minimumLiquidityPercentForSell}
                                helperText={touched.minimumLiquidityPercentForSell && errors.minimumLiquidityPercentForSell}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Front-Running HP-Activation Txns
                            </Typography>

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.frontrunHpActivationTxn}
                                    onChange={(e) => { setFieldValue( 'frontrunHpActivationTxn', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="frontrunHpActivationTxn"
                                />}
                                label="Frontrun HP Activation Transactions"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />


                            {/* dumpStaleTokensNumberOfBlocks */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="HP Activation Sell Tax Threshold"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.hpActivationSellTaxThreshold}
                                name="hpActivationSellTaxThreshold"
                                error={!!touched.hpActivationSellTaxThreshold && !!errors.hpActivationSellTaxThreshold}
                                helperText={touched.hpActivationSellTaxThreshold && errors.hpActivationSellTaxThreshold}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useBlockDelayForSimulatingSells}
                                    onChange={(e) => { setFieldValue( 'useBlockDelayForSimulatingSells', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useBlockDelayForSimulatingSells"
                                />}
                                label="Use Block Delay for Simulating Sells"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />


                            {/* dumpStaleTokensNumberOfBlocks */}
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Number of blocks to wait before simulating sells for HP activation"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.hpActivationBlockDelay}
                                name="hpActivationBlockDelay"
                                error={!!touched.hpActivationBlockDelay && !!errors.hpActivationBlockDelay}
                                helperText={touched.hpActivationBlockDelay && errors.hpActivationBlockDelay}
                                sx={{ gridColumn: "span 4" }}
                            />
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

export default BotSellTriggerConditions;
