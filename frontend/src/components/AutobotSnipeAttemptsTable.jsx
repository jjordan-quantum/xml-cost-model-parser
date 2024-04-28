import {getRandomInt, stringify} from "../utils/utils";
import {Box, Button, Typography, useTheme} from "@mui/material";
import {tokens} from "../theme";
import {DataGrid} from "@mui/x-data-grid";
import React, {useEffect, useState} from "react";
import {getStatus, getStatusWithoutLoggingData} from "../utils/getStatus";
import {SNIPER_SERVER_URL} from "../utils/constants";
import ProgressWheel from "./ProgressWheel";
import Modal, {ModalBody, ModalFooter, ModalHeader} from "./Modal";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";

const DEFAULT_ATTEMPT = {
    id: 0,
    blockNumber: 1,
    triggerType: 'DEFAULT',
    targetTokenName: 'DEFAULT',
    success: false,
    stage: 'DEFAULT',
    failureReason: 'DEFAULT',
    simulationDuration: 150,
};

const AutobotSnipeAttemptsTable = props => {
    const componentName = 'AutobotSnipeAttemptsTable';
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
    const [isPaused, setIsPaused] = useState(false);
    const [minBlockNumber, setMinBlockNumber] = useState(0);
    const [minBlockNumberFailed, setMinBlockNumberFailed] = useState(0);
    //const [highestBlock, setHighestBlock] = useState(0);

    // const initialPools = [];
    //
    // for(let id = 0; id < 100; id++) {
    //     initialPools.push({...DEFAULT_POOL, id});
    // }

    // const [rows, setRows] = useState(initialPools);
    const [rows, setRows] = useState([DEFAULT_ATTEMPT]);
    const [selectionModel, setSelectionModel] = useState([]);
    let highestId = 0;

    const highestBlock = rows[0].blockNumber;

    const getResultsForSnipe = (_id, _snipeId, _blockNumber) => {
        for(const row of rows) {
            if(!row) { continue; }
            const { id, snipeId, blockNumber } = row;

            if(
                _snipeId === snipeId
                && _blockNumber === blockNumber
            ) { return {...row}; }
        }

        return undefined;
    }

    // =================================================================================================================
    //
    //   get pools
    //
    // =================================================================================================================

    const getLogs = () => {
        // if(isPaused) {
        //     return cb();
        // }
        //
        // const start = Date.now();

        getStatusWithoutLoggingData(SNIPER_SERVER_URL, 'getSnipeAttemptsLogs', {}, (err, data) => {

            if(err) {
                // TODO - take no action
            } else if(!data) {
                log(`Data undefined in response for pools`);
                //return cb();
                //window.alert(`Data undefined in response for pools`);
            } else {
                try {
                    //log(`Got response data:`);
                    //console.log(data);

                    const values = Object.values(data);
                    //values.sort( (a,b) => (b.blockNumber - a.blockNumber) );

                    for(let i = 0; i < values.length; i++) {
                        values[i].id = i;
                    }

                    setRows(values.length > 0 ? values : [DEFAULT_ATTEMPT]);

                    // const values = Object.values(data);
                    // if(values.length === 0) {  return cb(); }
                    // values.sort( (a,b) => (a.blockNumber - b.blockNumber) );  // ascending
                    // const highestBlock = values[values.length - 1].blockNumber;  // last row
                    // log(`Got ${values.length} new logs with highest block ${highestBlock} in ${Date.now() - start}ms`);
                    //
                    // // rows is desc
                    // const ascRows = _rows.slice().reverse();
                    // const highestBlockInRows = ascRows[ascRows.length - 1] ? ascRows[ascRows.length - 1].blockNumber : undefined;
                    // const highestIdInRows = ascRows[ascRows.length - 1] ? ascRows[ascRows.length - 1].id : 0;
                    // log(`Currently ${ascRows.length} rows with highest block ${highestBlockInRows} and id ${highestIdInRows}`);
                    // let index = highestIdInRows;
                    //
                    // for(let i = 0; i < values.length; i++) {
                    //     index++;
                    //     values[i].id = index;
                    //     ascRows.push({...values[i]});
                    // }
                    //
                    // log(`Got total of ${ascRows.length} after adding new rows with highest index of ${index}`);
                    //
                    // const filteredLogs = ascRows
                    //     .filter(result => {
                    //         const {success, blockNumber} = result;
                    //
                    //         if(minBlockNumber) {
                    //             if(blockNumber < minBlockNumber) {
                    //                 return false;
                    //             }
                    //         }
                    //
                    //         if(minBlockNumberFailed) {
                    //             if(!success) {
                    //                 if(blockNumber < minBlockNumberFailed) {
                    //                     return false;
                    //                 }
                    //             }
                    //         }
                    //
                    //         return true;
                    //     });
                    //
                    // log(`Filtered ${filteredLogs.length} rows from combined rows in ${Date.now() - start}ms`);
                    //
                    // cb(
                    //     filteredLogs.length > 0
                    //         ? (
                    //             (filteredLogs.length > 10000 )
                    //                 ? filteredLogs.slice().reverse().slice(0, 10000)
                    //                 : filteredLogs.slice().reverse()
                    //         ) : [DEFAULT_ATTEMPT]
                    // );

                    // setHighestBlock(values[0].blockNumber);

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
                    log(e);
                   // return cb();
                }
            }
        });
    }

    useEffect(() => {
        // let isBusy = false;
        // let _rows = rows;
        //
        // const _setRows = (_newRows) => {
        //     console.log('Updating local rows');
        //     _rows = _newRows;
        // }
        //
        // const setIsBusy = (busy) => {
        //     console.log(`Setting isBusy to ${busy}`)
        //     isBusy = busy;
        // }

        const interval2 = setInterval(() => {
            getLogs();

            // if(isBusy) {
            //     log('Is busy - not fetching logs');
            // } else {
            //     setIsBusy(true);
            //
            //     getLogs(_rows, (newRows) => {
            //         if(newRows) {
            //             const maxId = newRows[0] ? newRows[0].id : undefined
            //             log(`Setting ${newRows.length} rows with max id ${maxId}`);
            //             setIsBusy(false);
            //             _setRows(newRows);
            //             setRows(newRows);
            //         } else {
            //             setIsBusy(false);
            //         }
            //     });
            // }
        }, 2500);

        return (() => {
            log(`Clearing interval`);
            clearInterval(interval2);
        });
    }, [isPaused, minBlockNumber, minBlockNumberFailed]);

    // =================================================================================================================
    //
    //   handler functions
    //
    // =================================================================================================================

    const handleViewResults = (id, snipeId, blockNumber) => {
        const results = getResultsForSnipe(id, snipeId, blockNumber);

        if(results) {
            setModalText(`Viewing attempt with snipeId ${id} at block ${blockNumber}\n\n${stringify(results)}`);
            setShowModal(true);
        } else {
            window.alert(`Results undefined for snipe attempt with snipeId ${id} at block ${blockNumber}`);
        }
    }

    const handleClearSnipeAttempts = (mode) => {
        if(mode === 'all') {
            setMinBlockNumber(highestBlock);
            setMinBlockNumberFailed(highestBlock);
            // TODO - update list of rows
        } else {
            setMinBlockNumberFailed(highestBlock);
            // TODO - update list of rows
        }
    }

    try {
        // tokenName

        // =================================================================================================================
        //
        //   pools datagrid
        //
        // =================================================================================================================

        const snipeAttemptsSelectionColumns = [
            { field: "snipeId", headerName: "Snipe ID", flex: 0.25 },
            {
                field: "targetTokenName",
                headerName: "Token",
                flex: 0.75,
            },
            {
                field: "blockNumber",
                headerName: "Block Number",
                flex: 0.5,
            },
            {
                field: "triggerType",
                headerName: "Type",
                flex: 0.25,
            },
            // {
            //     field: "success",
            //     headerName: "Success",
            //     flex: 0.25,
            // },
            {
                field: "success",
                headerName: "Success",
                flex: 0.25,
                renderCell: ({ row: { success} }) => {
                    return (
                        <Box
                            width="40px"
                            m="0 auto"
                            p="5px"
                            display="flex"
                            justifyContent="center"
                            alignItems="left"
                            color={success ? "limeGreen" : "red"}
                            // backgroundColor={colors.greenAccent[600]}
                            borderRadius="4px"
                        >
                            {success ? <CheckCircleOutlinedIcon /> : <RemoveCircleOutlineOutlinedIcon />}
                        </Box>
                    )
                }
            },
            {
                field: "stage",
                headerName: "Stage",
                flex: 0.5,
            },
            {
                field: "failureReason",
                headerName: "Reason",
                flex: 1,
            },
            {
                field: "simulationDuration",
                headerName: "Duration (ms)",
                flex: 0.5,
            },
            // {
            //     field: "account",
            //     headerName: "Acct",
            //     flex: 0.5,
            //     renderCell: ({ row: { account} }) => {
            //         return (
            //             <Box
            //                 width="40px"
            //                 m="0 auto"
            //                 p="5px"
            //                 display="flex"
            //                 justifyContent="left"
            //                 alignItems="left"
            //                 // backgroundColor={colors.greenAccent[600]}
            //                 borderRadius="4px"
            //             >
            //                 {`${account.slice(0, 6)}...${account.slice(account.length - 4, account.length)}`}
            //             </Box>
            //         )
            //     }
            // },
            {
                field: "fee",
                headerName: "Actions",
                flex: 0.5,
                renderCell: ({ row: { id, snipeId, blockNumber, account, tokenName, targetTokenAddress, poolAddress } }) => {
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
                            <Button color="secondary" variant="contained" size="medium" onClick={() => { handleViewResults(id, snipeId, blockNumber) }}>
                                View
                            </Button>
                        </Box>
                    )
                }
            },
        ];

        return (
            <Box>
                <Box
                    display="grid"
                    gap="30px"
                    gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                >
                    <Typography
                        variant="h4"
                        color="white"
                        sx={{ m: "15px 0 5px 20px", gridColumn: "span 1" }}
                    >
                        Snipe Attempts
                    </Typography>

                    <Box display="flex" mt="10px" p="10px" sx={{
                        gridColumn: "span 3"
                    }}>
                        <Box ml="5px" mr="5px">
                            <Button color="secondary" variant="contained" onClick={() => { handleClearSnipeAttempts('all') }}>
                                Clear
                            </Button>
                        </Box>

                        <Box ml="5px" mr="5px">
                            <Button color="secondary" variant="contained" onClick={() => { handleClearSnipeAttempts('failed') }}>
                                Clear Failed
                            </Button>
                        </Box>

                        <Box ml="5px" mr="5px">
                            <Button color="secondary" variant="contained" onClick={() => { setIsPaused(true); }}>
                                Pause
                            </Button>
                        </Box>

                        <Box ml="5px" mr="5px">
                            <Button color="secondary" variant="contained" onClick={() => { setIsPaused(false); }}>
                                Resume
                            </Button>
                        </Box>

                        {
                            isPaused
                            ?  <Typography
                                    variant="h4"
                                    color="red"
                                    ml="5px" mr="5px"
                                >
                                    PAUSED
                                </Typography>
                            :  <Typography
                                    variant="h4"
                                    color="limeGreen"
                                    ml="5px" mr="5px"
                                >
                                    UPDATING
                                </Typography>
                        }
                    </Box>
                </Box>

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
                    <div style={{height: 800}}>
                        <DataGrid
                            // rows={useContext(SwapParamsContext).swapParams}
                            checkboxSelection
                            rows={rows}
                            columns={snipeAttemptsSelectionColumns}
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
            </Box>
        );
    } catch(e) {
        console.log('Error with AutobotSnipeAttemptsTable');
        console.log(e);
        return <Box />;
    }
}

export default AutobotSnipeAttemptsTable;