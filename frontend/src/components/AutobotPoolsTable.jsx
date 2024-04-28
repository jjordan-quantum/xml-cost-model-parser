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

const DEFAULT_POOL = {
    id: 0,
    poolName: 'DEFAULT',
    poolAddress: 'DEFAULT',
    tokenName: 'DEFAULT',
    targetTokenAddress: 'DEFAULT',
    inActiveSnipeSession: false,
    sniped: false,
    isDropped: false,
};

const AutobotPoolsTable = props => {
    const componentName = 'AutobotPoolsTable';
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
    const [rows, setRows] = useState([DEFAULT_POOL]);
    const [selectionModel, setSelectionModel] = useState([]);

    const getPoolForAddress = (_poolAddress) => {
        for(const row of rows) {
            if(!row) { continue; }
            const { poolAddress } = row;
            if(!poolAddress) { continue; }
            if(poolAddress.toLowerCase() === _poolAddress.toLowerCase()) { return {...row}; }
        }

        return undefined;
    }

    // =================================================================================================================
    //
    //   get pools
    //
    // =================================================================================================================

    const getPools = () => {
        getStatusWithoutLoggingData(SNIPER_SERVER_URL, 'getTargetPoolsCache', {}, (err, data) => {

            if(err) {
                // TODO - take no action
            } else if(!data) {
                log(`Data undefined in response for pools`);
                //window.alert(`Data undefined in response for pools`);
            } else {
                try {
                    //log(`Got response data:`);
                    //console.log(data);
                    const pools = Object.values(data);

                    // const pools = values.filter((pool) => {
                    //     const {isDropped, isInvalid,} = pool;
                    //     return (!isInvalid && !isDropped);
                    // });

                    pools.sort( (a,b) => (b.blockNumberCreated - a.blockNumberCreated) );

                    for(let i = 0; i < pools.length; i++) {
                            const {
                                token0Symbol,
                                token1Symbol,
                                token0IsTargetToken,
                                token0Name,
                                token1Name,
                                poolAddress,
                                isDropped,
                            } = pools[i];

                        pools[i].id = i;
                        pools[i].poolName = (!!token0Symbol && !!token1Symbol) ? `${token0Symbol}-${token1Symbol}` : poolAddress;
                        pools[i].tokenName = token0IsTargetToken ? (token0Name || 'undefined') : (token1Name || 'undefined');
                        pools[i].isDropped = !!isDropped;
                    }

                    setRows(pools.length > 0 ? pools : [DEFAULT_POOL]);

                    // const pools = data; // object
                    // const keys = Object.keys(data);

                    // const indexedPools = [];
                    // let index = 0;
                    //
                    // for(const key of keys) {
                    //     const pool = pools[key];
                    //     if(!pool) { continue; }
                    //
                    //     const {
                    //         token0Symbol,
                    //         token1Symbol,
                    //         token0IsTargetToken,
                    //         token0Name,
                    //         token1Name,
                    //         poolAddress,
                    //         isDropped,
                    //         isInvalid,
                    //     } = pool;
                    //
                    //     if(isInvalid || isDropped) { continue; }  // todo - change this?
                    //
                    //     indexedPools.push({
                    //         ...pool,
                    //         id: index,
                    //         poolName: (!!token0Symbol && !!token1Symbol) ? `${token0Symbol}-${token1Symbol}` : poolAddress,
                    //         tokenName: token0IsTargetToken ? (token0Name || 'undefined') : (token1Name || 'undefined'),
                    //         isDropped: !!isDropped,
                    //     });
                    //
                    //     index++;
                    // }
                    //
                    // setRows(indexedPools.length > 0 ? indexedPools : [DEFAULT_POOL]);
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

    const handleViewPool = (id ,poolName, poolAddress) => {
        const pool = getPoolForAddress(poolAddress);

        if(pool) {
            setModalText(`Viewing pool ${poolName} @ ${poolAddress}\n\n${stringify(pool)}`);
            setShowModal(true);
        } else {
            window.alert(`Pool undefined: ${poolName} @ ${poolAddress}`);
        }
    }

    const handleDropPool = async (id ,poolName, poolAddress) => {
        if(poolName === 'DEFAULT' && poolAddress === 'DEFAULT') {
            window.alert(`Cannot drop default pool!`);
            return;
        }

        if(window.confirm(`Are you sure you want to drop pool ${poolName} @ ${poolAddress}`)) {
            setWaiting(true);

            const [err, data] = await sendCommandWithPromise(SNIPER_SERVER_URL, 'dropPool', 'sync', {
                poolAddress,
            });

            setWaiting(false);

            if(err) {

            } else if(!data) {
                log(`Data undefined in response to drop pool`);
                window.alert(`Data undefined in response to drop pool`);
            } else {
                const { success, message, error } = data;

                if(!success) {
                    const _message = `Sniper app failed to drop pool: ${message} ${error ? '\n' + error : ''}`;
                    log(_message);
                    window.alert(_message);
                } else {
                    window.alert(`Dropped pool ${poolName} @ ${poolAddress}`);
                    return true;
                }
            }
        }
    }

    const handleDropToken = async (id, tokenName, targetTokenAddress) => {
        if(tokenName === 'DEFAULT' && targetTokenAddress === 'DEFAULT') {
            window.alert(`Cannot drop default pool token!`);
            return;
        }

        if(window.confirm(`Are you sure you want to drop all pools with token ${tokenName} @ ${targetTokenAddress}`)) {
            setWaiting(true);

            const [err, data] = await sendCommandWithPromise(SNIPER_SERVER_URL, 'dropToken', 'sync', {
                targetTokenAddress,
            });

            setWaiting(false);

            if(err) {

            } else if(!data) {
                log(`Data undefined in response to drop token`);
                window.alert(`Data undefined in response to drop token`);
            } else {
                const { success, message, error } = data;

                if(!success) {
                    const _message = `Sniper app failed to drop token: ${message} ${error ? '\n' + error : ''}`;
                    log(_message);
                    window.alert(_message);
                } else {
                    window.alert(`Dropped token ${tokenName} @ ${targetTokenAddress}`);
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
            //{ field: "id", headerName: "ID", flex: 0.25 },
            {
                field: "poolName",
                headerName: "Pool",
                flex: 0.75,
                cellClassName: "description-column--cell"
            },
            {
                field: "blockNumberCreated",
                headerName: "Block Created",
                flex: 0.5,
            },
            {
                field: "tokenName",
                headerName: "Token",
                flex: 0.75,
            },
            {
                field: "targetTokenAddress",
                headerName: "Token Address",
                flex: 1,
            },
            {
                field: "isDropped",
                headerName: "Valid",
                flex: 0.5,
                renderCell: ({ row: { id, isDropped, isInvalid, } }) => {
                    return (
                        <Box
                            width="40px"
                            m="0 auto"
                            p="5px"
                            display="flex"
                            justifyContent="center"
                            alignItems="left"
                            color={(!isDropped && !isInvalid) ? "limeGreen" : "red"}
                            // backgroundColor={colors.greenAccent[600]}
                            borderRadius="4px"
                        >
                            {(!isDropped && !isInvalid) ? <CheckCircleOutlinedIcon /> : <RemoveCircleOutlineOutlinedIcon />}
                        </Box>
                    )
                }
            },
            {
                field: "inActiveSnipeSession",
                headerName: "Active",
                flex: 0.5,
                renderCell: ({ row: { id, poolAddress, poolName, targetTokenAddress, tokenName, inActiveSnipeSession} }) => {
                    return (
                        <Box
                            width="40px"
                            m="0 auto"
                            p="5px"
                            display="flex"
                            justifyContent="center"
                            alignItems="left"
                            color={inActiveSnipeSession ? "limeGreen" : "red"}
                            // backgroundColor={colors.greenAccent[600]}
                            borderRadius="4px"
                        >
                            {inActiveSnipeSession ? <NotificationsActiveOutlinedIcon /> : <NotificationsOutlinedIcon />}
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
                field: "sniped",
                headerName: "Sniped",
                flex: 0.5,
                renderCell: ({ row: { id, poolAddress, poolName, targetTokenAddress, tokenName, sniped} }) => {
                    return (
                        <Box
                            width="40px"
                            m="0 auto"
                            p="5px"
                            display="flex"
                            justifyContent="center"
                            alignItems="left"
                            color={sniped ? "limeGreen" : "red"}
                            // backgroundColor={colors.greenAccent[600]}
                            borderRadius="4px"
                        >
                            {sniped ? <CheckCircleOutlinedIcon /> : <RemoveCircleOutlineOutlinedIcon />}
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
                renderCell: ({ row: { id, poolAddress, poolName, targetTokenAddress, tokenName, } }) => {
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
                            <Button color="secondary" variant="contained" size="medium" onClick={() => { handleViewPool(id, poolName, poolAddress) }}>
                                View
                            </Button>
                            <Button color="secondary" variant="contained" size="medium" sx={{minWidth: '85px'}} onClick={() => { handleDropPool(id, poolName, poolAddress) }}>
                                Drop Pool
                            </Button>
                            <Button color="secondary" variant="contained" size="medium" sx={{minWidth: '85px'}} onClick={() => { handleDropToken(id, tokenName, targetTokenAddress,) }}>
                                Drop Token
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
        console.log('Error with AutobotPoolsTable');
        console.log(e);
        return <Box />;
    }
}

export default AutobotPoolsTable;