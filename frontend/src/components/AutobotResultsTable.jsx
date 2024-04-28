import {getRandomInt, stringify} from "../utils/utils";
import {Box, Button, useTheme} from "@mui/material";
import {tokens} from "../theme";
import {DataGrid} from "@mui/x-data-grid";
import React, {useEffect, useState} from "react";
import {getStatus, getStatusWithoutLoggingData} from "../utils/getStatus";
import {SNIPER_SERVER_URL} from "../utils/constants";
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import {sendCommandWithPromise} from "../utils/sendCommand";
import ProgressWheel from "./ProgressWheel";
import Modal, {ModalBody, ModalFooter, ModalHeader} from "./Modal";

const DEFAULT_RESULT = {
    id: 0,
    snipeId: 1,
    poolAddress: 'DEFAULT',
    tokenName: 'DEFAULT',
    targetTokenAddress: 'DEFAULT',
    account: 'DEFAULT',
    buyTxnHash: 'DEFAULT',

    isApproved: false,
    inActiveSwapBackSession: false,
    swapBackTxSuccessful: false,
};

const AutobotResultsTable = props => {
    const componentName = 'AutobotResultsTable';
    const log = (message) => console.log(`[${componentName}] ${message}`);
    const componentId = getRandomInt();

    // =================================================================================================================
    //
    //  set up theme
    //
    // =================================================================================================================

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // =================================================================================================================
    //
    //  set up / initialize state
    //
    // =================================================================================================================

    const [waiting, setWaiting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalText, setModalText] = useState('SAMPLE MODAL TEXT');

    // const initialPools = [];
    //
    // for(let id = 0; id < 100; id++) {
    //     initialPools.push({...DEFAULT_POOL, id});
    // }

    // const [rows, setRows] = useState(initialPools);
    const [rows, setRows] = useState([DEFAULT_RESULT]);
    const [selectionModel, setSelectionModel] = useState([]);

    const getResultsForSnipe = (_snipeId, _account) => {
        for(const row of rows) {
            if(!row) { continue; }
            const { snipeId, account } = row;
            if(!snipeId) { continue; }
            if(!account) { continue; }

            if(
                (snipeId === _snipeId)
                && (account.toLowerCase() === _account.toLowerCase())
            ) {
                return {...row};
            }
        }

        return undefined;
    }

    // =================================================================================================================
    //
    //   get pools
    //
    // =================================================================================================================

    const getPools = () => {
        getStatusWithoutLoggingData(SNIPER_SERVER_URL, 'getSnipeResultsCache', {}, (err, data) => {

            if(err) {
                // TODO - take no action
            } else if(!data) {
                log(`Data undefined in response for pools`);
                //window.alert(`Data undefined in response for pools`);
            } else {
                try {
                    //log(`Got response data:`);
                    //console.log(data);

                    const values = Object.values(data);
                    values.sort( (a,b) => (b.buyTxnBlockNumber - a.buyTxnBlockNumber) );

                    for(let i = 0; i < values.length; i++) {
                        const {
                            tokenName,
                            targetTokenAddress,
                        } = values[i];

                        values[i].id = i;
                        values[i].tokenName = tokenName ? tokenName : targetTokenAddress;
                    }

                    setRows(values.length > 0 ? values : [DEFAULT_RESULT]);


                    // const results = data; // object
                    // const keys = Object.keys(data);
                    //
                    // const indexedResults = [];
                    // let index = 0;
                    //
                    // for(const key of keys) {
                    //     const result = results[key];
                    //     if(!result) { continue; }
                    //
                    //     const {
                    //         tokenName,
                    //         targetTokenAddress,
                    //     } = result;
                    //
                    //     indexedResults.push({
                    //         ...result,
                    //         id: index,
                    //         tokenName: tokenName ? tokenName : targetTokenAddress,
                    //     });
                    //
                    //     index++;
                    // }
                    //
                    // setRows(indexedResults.length > 0 ? indexedResults : [DEFAULT_RESULT]);
                    // setRows(indexedPools.length > 0 ? indexedPools : initialPools);
                } catch(e) {
                    log(`Error processing pools`);
                }
            }
        });
    }

    useEffect(() => {
        const interval2 = setInterval(() => {
            getPools();
        }, 2000);

        return (() => {
            log(`Clearing interval`);
            clearInterval(interval2);
        });
    }, []);

    // =================================================================================================================
    //
    //   handler functions
    //
    // =================================================================================================================

    const handleViewResults = (id , snipeId, account) => {
        const results = getResultsForSnipe(snipeId, account);

        if(results) {
            setModalText(`Viewing results for snipe ${snipeId} for acct ${account}\n\n${stringify(results)}`);
            setShowModal(true);
        } else {
            window.alert(`Results undefined for snipe ${snipeId} for acct ${account}`);
        }
    }

    const handleDumpTokens = async (id , snipeId, account, tokenName, tokenAddress, poolAddress) => {
        // TODO
        if(account === 'DEFAULT' && snipeId === 1) {
            window.alert(`Cannot dump tokens for default result!`);
            return;
        }

        if(window.confirm(`Are you sure you want to dump tokens ${tokenName} @ ${tokenAddress}?`)) {
            setWaiting(true);

            const [err, data] = await sendCommandWithPromise(SNIPER_SERVER_URL, 'dumpTokens', 'sync', {
                snipeId, account, tokenName, tokenAddress, poolAddress
            });

            setWaiting(false);

            if(err) {

            } else if(!data) {
                log(`Data undefined in response to dump token`);
                window.alert(`Data undefined in response todump token`);
            } else {
                const { success, message, error } = data;

                if(!success) {
                    const _message = `Sniper app failed to dump tokens: ${message} ${error ? '\n' + error : ''}`;
                    log(_message);
                    window.alert(_message);
                } else {
                    window.alert(`Token staged for dump: ${tokenName} @ ${tokenAddress}`);
                    return true;
                }
            }
        }
    }

    try {
        // tokenName

        // =================================================================================================================
        //
        //   pools datagrid
        //
        // =================================================================================================================

        const poolsSelectionColumns = [
            { field: "snipeId", headerName: "Snipe ID", flex: 0.25 },
            {
                field: "tokenName",
                headerName: "Token",
                flex: 1,
            },
            {
                field: "buyTxnBlockNumber",
                headerName: "Block Number",
                flex: 0.5,
            },
            // {
            //     field: "poolAddress",
            //     headerName: "Pool",
            //     flex: 1,
            // },
            {
                field: "account",
                headerName: "Acct",
                flex: 0.5,
                renderCell: ({ row: { account} }) => {
                    return (
                        <Box
                            width="40px"
                            m="0 auto"
                            p="5px"
                            display="flex"
                            justifyContent="left"
                            alignItems="left"
                            // backgroundColor={colors.greenAccent[600]}
                            borderRadius="4px"
                        >
                            {`${account.slice(0, 6)}...${account.slice(account.length - 4, account.length)}`}
                        </Box>
                    )
                }
            },
            {
                field: "buyTxnHash",
                headerName: "Buy Txn",
                flex: 1.5,
            },
            // {
            //     field: "nativeTokenCostWei",
            //     headerName: "Native Cost",
            //     flex: 0.5,
            // },
            // {
            //     field: "targetTokensAmountReceived",
            //     headerName: "Tokens Received",
            //     flex: 0.5,
            // },
            {
                field: "isApproved",
                headerName: "Approved",
                flex: 0.5,
                renderCell: ({ row: { isApproved} }) => {
                    return (
                        <Box
                            width="40px"
                            m="0 auto"
                            p="5px"
                            display="flex"
                            justifyContent="center"
                            alignItems="left"
                            color={isApproved ? "limeGreen" : "red"}
                            // backgroundColor={colors.greenAccent[600]}
                            borderRadius="4px"
                        >
                            {isApproved ? <CheckCircleOutlinedIcon /> : <RemoveCircleOutlineOutlinedIcon />}
                        </Box>
                    )
                }
            },
            {
                field: "inActiveSwapBackSession",
                headerName: "Active",
                flex: 0.5,
                renderCell: ({ row: { inActiveSwapBackSession} }) => {
                    return (
                        <Box
                            width="40px"
                            m="0 auto"
                            p="5px"
                            display="flex"
                            justifyContent="center"
                            alignItems="left"
                            color={inActiveSwapBackSession ? "limeGreen" : "red"}
                            // backgroundColor={colors.greenAccent[600]}
                            borderRadius="4px"
                        >
                            {inActiveSwapBackSession ? <NotificationsActiveOutlinedIcon /> : <NotificationsOutlinedIcon />}
                        </Box>
                    )
                }
            },
            // {
            //     field: "sniped",
            //     headerName: "Sniped",
            //     flex: 0.5,
            // },
            {
                field: "swapBackTxSuccessful",
                headerName: "Sold",
                flex: 0.5,
                renderCell: ({ row: { swapBackTxSuccessful, isDumped} }) => {
                    return (
                        <Box
                            width="40px"
                            m="0 auto"
                            p="5px"
                            display="flex"
                            justifyContent="center"
                            alignItems="left"
                            color={(swapBackTxSuccessful || !!isDumped) ? "limeGreen" : "red"}
                            // backgroundColor={colors.greenAccent[600]}
                            borderRadius="4px"
                        >
                            {(swapBackTxSuccessful || !!isDumped) ? <CheckCircleOutlinedIcon /> : <RemoveCircleOutlineOutlinedIcon />}
                        </Box>
                    )
                }
            },
            // {
            //     field: "isDropped",
            //     headerName: "Dropped",
            //     flex: 1,
            // },
            {
                field: "fee",
                headerName: "Actions",
                flex: 1,
                renderCell: ({ row: { id, snipeId, account, tokenName, targetTokenAddress, poolAddress } }) => {
                    return (
                        <Box
                            width="40px"
                            m="0 auto"
                            p="5px"
                            display="flex"
                            justifyContent="center"
                            alignItems="left"
                            // backgroundColor={colors.greenAccent[600]}
                            borderRadius="4px"
                        >
                            <Button color="secondary" variant="contained" size="medium" onClick={() => { handleViewResults(id, snipeId, account) }}>
                                View
                            </Button>
                            <Button color="secondary" variant="contained" size="medium" sx={{minWidth: '95px'}} onClick={() => { handleDumpTokens(id, snipeId, account, tokenName, targetTokenAddress, poolAddress) }}>
                                Dump Tokens
                            </Button>
                        </Box>
                    )
                }
            },
        ];

        return (
            <Box
                m="20px 0 20px 0"
                sx={{
                    // "& .MuiDataGrid-root": {
                    //     border: "none",
                    // },
                    "& .MuiDataGrid-cell": {
                        borderBottom: "none",
                    },
                    "& .description-column--cell": {
                        color: colors.greenAccent[300],
                    },
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: colors.blueAccent[700],
                        borderBottom: "none",
                    },
                    "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: colors.primary[400],
                    },
                    "& .MuiDataGrid-footerContainer": {
                        borderTop: "none",
                        backgroundColor: colors.blueAccent[700],
                    },
                    '& .MuiCheckbox-root.Mui-checked': {
                        backgroundColor: colors.greenAccent[400],
                        borderColor: '#1890ff',
                    },
                }}
            >
                <div style={{height: 500}}>
                    <DataGrid
                        // rows={useContext(SwapParamsContext).swapParams}
                        checkboxSelection
                        rows={rows}
                        columns={poolsSelectionColumns}
                        //pageSizeOptions={[5, 10, 25]}
                        //rowSelectionModel={selectionModel}
                        // onSelectionModelChange={() => {
                        //     setSelectionModel
                        // }}
                        // onRowSelectionModelChange={(rowSelectionModel, details) => {
                        //     console.log("row selection model changed");
                        //     console.log(rowSelectionModel);
                        //
                        //     // for(const id of rowSelectionModel) {
                        //     //     const account = accounts[id];
                        //     //     console.log(`Account ${account.address} is selected`);
                        //     // }
                        //
                        //     //updateSelectedAccounts(rowSelectionModel);  // external
                        //     setSelectionModel(rowSelectionModel);  // internal
                        //     //setSettingsValidated(false);  // put in updateSelectedAccounts
                        // }}
                    />
                </div>

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
    } catch(e) {
        console.log('Error with AutobotResultsTable');
        console.log(e);
        return <Box />;
    }
}

export default AutobotResultsTable;