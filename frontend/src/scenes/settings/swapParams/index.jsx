import {
    Box,
    Button,
    TextField,
    Switch,
    FormControlLabel,
    InputLabel,
    FormControl,
    FormHelperText, FormLabel, RadioGroup, Radio, useTheme, Typography
} from "@mui/material";
import { Formik } from "formik";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../../components/Header";
import swapParamsSchema from "../../../data/schemas/swapParamsSchema";
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import useSessionStorage from "../../../utils/useSessionStorage";
import {MenuItem} from "react-pro-sidebar";
import React from "react";
import {tokens} from "../../../theme";
import Select, { Option, ReactSelectProps } from 'react-select'
import * as yup from "yup";
import {validateSwapParams} from "../../../utils/validators/validateSwapParams";
import {isDescriptionUnique, stringify} from "../../../utils/utils";
import defaultAccounts, {ensureDefaultAccounts} from "../../../data/defaults/defaultAccounts";
import {ensureDefaultSwapParams} from "../../../data/defaults/defaultSwapParamsPresets";

const initialValues = {
    id: undefined,
    description: "",
    router: "",
    routerSelect: "Router",
    useMevExecutor: false,
    onlyBuyOnce: false,
    useSpecificInput: false,
    specificInput: "",
    functionSelect: "9",
    swapType: "",
    txValue: "",
    txGas: "",
    amountIn: "",
    amountOut: "",
    sqrtPriceX96: "",
    fee: "",
    swapPath: "",
    poolIdPath: "",
    recipient: "",
    deadline: "",
    useSlippage: false,
    slippagePercent: "",

    // multi-router
    useMultiRouter: false,
    useMultiPath: false,
    routers: '',
    stableCoins: '',
    minEthLiquidityForMultiRouter: '',
    minUsdLiquidityForMultiRouter: '',

    targetTokenAddress: '',
};


const SwapParams = () => {  // TODO - use loadId
    const componentName = 'SwapParams';
    const log = (message) => console.log(`[${componentName}] ${message}`);
    const { state } = useLocation();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const {
        loadId,
        loadMode,
        origin,
        originId,
    } = (!!state ? state : {});

    const isNonMobile = useMediaQuery("(min-width:600px");
    const navigate = useNavigate();

    const [accounts, setAccounts] = useSessionStorage('accounts', defaultAccounts);

    const [swapParams, setSwapParams] = useSessionStorage('swapParams', []);


    if(!accounts || accounts.length === 0) {
        setAccounts(defaultAccounts);
    }

    ensureDefaultAccounts(accounts, setAccounts);
    ensureDefaultSwapParams(swapParams, setSwapParams);

    const getValuesForId = (id) => {
        try {
            return swapParams.filter(o => (
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
                ...(getValuesForId(loadId) || initialValues),
                id: (_loadMode && _loadMode === 'edit') ? loadId : undefined,
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
                        useSwapParamsId: _id,
                    }
                }
            );
        } else {
            navigate('/swap-params-presets');
        }
    }

    const handleSave = (values) => {
        let savedId;
        log(`Saving swap params`);

        try {
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

            const { success, message } = validateSwapParams({...values});

            if(!success || message) {
                log(message);
                window.alert(message);
                if(!success) { return; }
            }

            if(typeof(values.id) !== 'undefined') {
                // console.log(`params have id ${values.id}`);
                let index = -1;

                for(let i = 0; i < swapParams.length; i++) {
                    const { id } = swapParams[i];

                    if(values.id === id) {
                        index = i;
                        break;
                    }
                }

                if(index === -1) {
                    // did not find
                    if(!isDescriptionUnique(description, swapParams || [])) {
                        log(`description must be unique - already have an entry for:\n\n${description}`);
                        window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                        return;
                    }

                    swapParams.push({...values});
                } else {
                    swapParams[index] = {...values};
                }
            } else {
                let maxId = -1;

                if(!isDescriptionUnique(description, swapParams || [])) {
                    log(`description must be unique - already have an entry for:\n\n${description}`);
                    window.alert(`description must be unique - already have an entry for:\n\n${description}`);
                    return;
                }

                for(const item of swapParams) {
                    if(item && typeof(item.id) !== 'undefined') {
                        if(item.id > maxId) {
                            maxId = item.id;
                        }
                    }
                }

                // console.log(`Max id is ${maxId}`);
                const nextId = (typeof(maxId) === 'number') ? maxId + 1 : 1;
                // console.log(`Next id is ${nextId}`);

                swapParams.push({
                    ...values,
                    id: nextId,
                });

                savedId = nextId;
                values.id = savedId;
            }

            setSwapParams(swapParams);
            let useSwapParamsId;

            if(typeof(values.id) !== 'undefined') {
                useSwapParamsId = values.id;
                    window.alert(`Swap params updated for preset # ${values.id} with description:\n ${values.description}
                    ${'\nSaved settings: ' + stringify(values)}
                `);
            } else {
                useSwapParamsId = savedId;
                    window.alert(`Swap params saved as preset # ${savedId} with description: \n ${values.description}
                    ${'\nSaved settings: ' + stringify(values)}
                `);
            }

            return useSwapParamsId;
        } catch(e) {
            log(`Error saving swap params`);
            console.log(e);
            window.alert(`Error saving swap params: ${e.toString()}`);
            return undefined;
        }
    }

    const handleFormSubmit = (values) => {
        let savedId;

        const useSwapParamsId = handleSave(values);

        if(typeof(useSwapParamsId) !== 'undefined') {
            _navigate(useSwapParamsId);
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

    const functionSelectOptions = [
        { value: '9', label: '9 - swapETHForExactTokens  (univ3 - exactOutput)' },
        { value: '10', label: '10 - swapExactETHForTokens  (univ3 - exactInput)' },
        { value: '11', label: '11 - swapExactETHForTokensSupportingFeeOnTransferTokens (univ3: unavailable)' },
    ];

    const routerSelectOptions = [
        { value: 'UniswapV2', label: 'UniswapV2 Router (default option)' },
        { value: 'UniswapV3', label: 'UniswapV3 Router' },
        { value: 'Balancer', label: 'Balancer Router' },
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
        <Box m="20px" minHeight="85vh">
            <Header title="SWAP PARAMETERS" subtitle="Create / edit swap parameters preset" />

            <Formik
                onSubmit={handleFormSubmit}
                initialValues={getInitialValues(loadId, loadMode)}
                validationSchema={swapParamsSchema}
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
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Router / To Address"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.router}
                                name="router"
                                error={!!touched.router && !!errors.router}
                                helperText={touched.router && errors.router}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <Typography
                                variant="h6"
                                color="white"
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 1" }}
                            >
                                Router Type
                            </Typography>

                            <FormControl sx={{
                                gridColumn: "span 3"
                            }}>
                                <Select
                                    options={routerSelectOptions}
                                    name="routerSelect"
                                    value={(routerSelectOptions ? routerSelectOptions.find(option => option.value === values.routerSelect) : '')}
                                    onChange={(option) => { setFieldValue( 'routerSelect', option.value, false  ) }}
                                    onBlur={handleBlur}
                                    styles={customStyles}
                                />
                            </FormControl>

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useMevExecutor}
                                    onChange={(e) => { setFieldValue( 'useMevExecutor', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useMevExecutor"
                                />}
                                label="Use MEV Executor Contract for Snipes?"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.onlyBuyOnce}
                                    onChange={(e) => { setFieldValue( 'onlyBuyOnce', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="onlyBuyOnce"
                                />}
                                label="Only Buy Token Once With Executor Contract"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useSpecificInput}
                                    onChange={(e) => { setFieldValue( 'useSpecificInput', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useSpecificInput"
                                />}
                                label="Use Specific Tx Input"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Specific Input for Transaction"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.specificInput}
                                name="specificInput"
                                error={!!touched.specificInput && !!errors.specificInput}
                                helperText={touched.specificInput && errors.specificInput}
                                sx={{ gridColumn: "span 3" }}
                            />

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Function Select
                            </Typography>

                            <FormControl sx={{
                                gridColumn: "span 4"
                            }}>
                                <Select
                                    options={functionSelectOptions}
                                    name="functionSelect"
                                    value={(functionSelectOptions ? functionSelectOptions.find(option => option.value === values.functionSelect) : '')}
                                    onChange={(option) => { setFieldValue( 'functionSelect', option.value, false  ) }}
                                    onBlur={handleBlur}
                                    styles={customStyles}
                                />
                            </FormControl>

                            {/*<Typography*/}
                            {/*    variant="h4"*/}
                            {/*    color={colors.greenAccent[400]}*/}
                            {/*    sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}*/}
                            {/*>*/}
                            {/*    Swap Type (only required for Balancer snipes)*/}
                            {/*</Typography>*/}


                            {/*/!* TODO - add a select box ?? *!/*/}
                            {/*<TextField*/}
                            {/*    fullWidth*/}
                            {/*    variant="filled"*/}
                            {/*    type="text"*/}
                            {/*    label="Swap Type (only required for Balancer snipes)"*/}
                            {/*    onBlur={handleBlur}*/}
                            {/*    onChange={handleChange}*/}
                            {/*    value={values.swapType}*/}
                            {/*    name="swapType"*/}
                            {/*    error={!!touched.swapType && !!errors.swapType}*/}
                            {/*    helperText={touched.swapType && errors.swapType}*/}
                            {/*    sx={{ gridColumn: "span 4" }}*/}
                            {/*/>*/}

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Transaction Fields and Swap Params
                            </Typography>

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Tx Value"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.txValue}
                                name="txValue"
                                error={!!touched.txValue && !!errors.txValue}
                                helperText={touched.txValue && errors.txValue}
                                sx={{ gridColumn: "span 4" }}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Tx Gas Limit"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.txGas}
                                name="txGas"
                                error={!!touched.txGas && !!errors.txGas}
                                helperText={touched.txGas && errors.txGas}
                                sx={{ gridColumn: "span 4" }}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Amount In"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.amountIn}
                                name="amountIn"
                                error={!!touched.amountIn && !!errors.amountIn}
                                helperText={touched.amountIn && errors.amountIn}
                                sx={{ gridColumn: "span 4" }}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Amount Out"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.amountOut}
                                name="amountOut"
                                error={!!touched.amountOut && !!errors.amountOut}
                                helperText={touched.amountOut && errors.amountOut}
                                sx={{ gridColumn: "span 4" }}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="SqrtPriceX96 - Only For UniswapV3 snipes (optional)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.sqrtPriceX96}
                                name="sqrtPriceX96"
                                error={!!touched.sqrtPriceX96 && !!errors.sqrtPriceX96}
                                helperText={touched.sqrtPriceX96 && errors.sqrtPriceX96}
                                sx={{ gridColumn: "span 4" }}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Fee Path - Only for UniswapV3 snipes (optional)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.fee}
                                name="fee"
                                error={!!touched.fee && !!errors.fee}
                                helperText={touched.fee && errors.fee}
                                sx={{ gridColumn: "span 4" }}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Swap Path - Exclude target token - that will be added in snipe session screen"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.swapPath}
                                name="swapPath"
                                error={!!touched.swapPath && !!errors.swapPath}
                                helperText={touched.swapPath && errors.swapPath}
                                sx={{ gridColumn: "span 4" }}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Pool ID Path - Only required for Balancer snipes"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.poolIdPath}
                                name="poolIdPath"
                                error={!!touched.poolIdPath && !!errors.poolIdPath}
                                helperText={touched.poolIdPath && errors.poolIdPath}
                                sx={{ gridColumn: "span 4" }}
                            />
                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Recipient"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.recipient}
                                name="recipient"
                                error={!!touched.recipient && !!errors.recipient}
                                helperText={touched.recipient && errors.recipient}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Deadline"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.deadline}
                                name="deadline"
                                error={!!touched.deadline && !!errors.deadline}
                                helperText={touched.deadline && errors.deadline}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useSlippage}
                                    onChange={(e) => { setFieldValue( 'useSlippage', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useSlippage"
                                />}
                                label="Use Slippage"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 1" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Slippage Percent (default is 60)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.slippagePercent}
                                name="slippagePercent"
                                error={!!touched.slippagePercent && !!errors.slippagePercent}
                                helperText={touched.slippagePercent && errors.slippagePercent}
                                sx={{ gridColumn: "span 3" }}
                            />

                            <Typography
                                variant="h4"
                                color={colors.greenAccent[400]}
                                sx={{ m: "15px 0 5px 20px", gridColumn: "span 4" }}
                            >
                                Multi-Router / Multi-Path Options
                            </Typography>

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useMultiRouter}
                                    onChange={(e) => { setFieldValue( 'useMultiRouter', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useMultiRouter"
                                />}
                                label="Use Multi-Router (Router Address field above not required)"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="List of Router Addresses for Multi-Router (univ3 / univ2 clones)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.routers}
                                name="routers"
                                error={!!touched.routers && !!errors.routers}
                                helperText={touched.routers && errors.routers}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <FormControlLabel
                                // fullWidth
                                variant="filled"
                                // type="text"
                                control={ <Switch
                                    checked={values.useMultiPath}
                                    onChange={(e) => { setFieldValue( 'useMultiPath', e.target.checked, false  ) }}
                                    color="secondary"
                                    name="useMultiPath"
                                />}
                                label="Use Multi-Path (Swap Path field above not required)"
                                //value={values.autoApproveRouter}
                                // error={!!touched.useMevExecutor && !!errors.useMevExecutor}
                                // helperText={touched.useMevExecutor && errors.useMevExecutor}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="List of Stablecoin Addresses to use for multi-hop options for Multi-Path"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.stableCoins}
                                name="stableCoins"
                                error={!!touched.stableCoins && !!errors.stableCoins}
                                helperText={touched.stableCoins && errors.stableCoins}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Minimum ETH liquidity for filtering WETH-based pools for Multi-Router / Multi-Path (required)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.minEthLiquidityForMultiRouter}
                                name="minEthLiquidityForMultiRouter"
                                error={!!touched.minEthLiquidityForMultiRouter && !!errors.minEthLiquidityForMultiRouter}
                                helperText={touched.minEthLiquidityForMultiRouter && errors.minEthLiquidityForMultiRouter}
                                sx={{ gridColumn: "span 4" }}
                            />

                            <TextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Minimum USD liquidity for filtering stablecoin pools for Multi-Router / Multi-Path (required)"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.minUsdLiquidityForMultiRouter}
                                name="minUsdLiquidityForMultiRouter"
                                error={!!touched.minUsdLiquidityForMultiRouter && !!errors.minUsdLiquidityForMultiRouter}
                                helperText={touched.minUsdLiquidityForMultiRouter && errors.minUsdLiquidityForMultiRouter}
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

export default SwapParams;
