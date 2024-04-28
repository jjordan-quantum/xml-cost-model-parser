import {Box, useTheme} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";
import React, {useEffect, useState} from "react";
import {getStatusWithoutAlert, getStatusWithoutLoggingData} from "../utils/getStatus";
import {SNIPER_SERVER_URL} from "../utils/constants";
import {getRandomInt} from "../utils/utils";
import {tokens} from "../theme";

const AccountsUpdater = props => {
    const componentName = 'AccountsUpdater';
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

    const { useTargetToken, accounts, updateSelectedAccounts, initialSelection } = props;

    const [rows, setRows] = useState(accounts || []);
    const [selectionModel, setSelectionModel] = useState(initialSelection || []);

    let loggedError = true;
    let intervalCounter = 0;

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         loggedError = false;
    //     }, 2000);
    //
    //     return () => clearTimeout(timer);
    // }, []);
    //
    // useEffect(() => {
    //     const interval1 = setInterval(() => {
    //         if(intervalCounter) {
    //             loggedError = false;
    //         }
    //
    //         intervalCounter++;
    //     }, (5*60*1000));
    //
    //     return () => clearInterval(interval1);
    // }, []);


    const getUpdateForAccounts = () => {
        // TODO _ remove this
        //return;
        //log(`[${componentId}] Fetching account update`);

        getStatusWithoutLoggingData(SNIPER_SERVER_URL, 'getAccountUpdateForSnipeSession', {}, (err, data) => {
            if(err) {
                // TODO - take no action
                loggedError = true;
            } else if(!data) {
                if(!loggedError) {
                    loggedError = true;
                    log(`Data undefined in response to request for getting account updates`);
                    //window.alert(`[${componentId}] Data undefined in response to request for getting account updates`);
                }
            } else {
                const { success, error, message, accountStates } = data;

                if(!success) {
                    const _message = `Failed to get update for accounts: ${message}`;

                    if(!loggedError) {
                        loggedError = true;
                        log(_message);
                        //window.alert(_message);
                    }
                } else if(!accountStates) {
                    const _message = `accountStates undefined - cannot get update for accounts: ${message}`;

                    if(!loggedError) {
                        loggedError = true;
                        log(_message);
                        //window.alert(_message);
                    }
                } else {
                    try {
                        const accountsClone = JSON.parse(JSON.stringify(accounts));

                        for(const account of accountStates) {
                            const row = accountsClone.filter((_account) => {
                                return (
                                    !!_account
                                    && _account.address
                                    && !!account
                                    && account.address
                                    && _account.address.toLowerCase() === account.address.toLowerCase()
                                );
                            })[0];

                            if(!row) { continue; }  // no account found for address
                            row.balance = account.balance;
                            row.nonce = account.nonce;
                            row.sent = account.sent;
                            row.pending = account.pending;
                            row.confirmed = account.confirmed;
                            row.tokenBalance = account.targetTokenBalance;
                        }

                        setRows(accountsClone);
                    } catch(e) {
                        log(`Error updating account states`);
                        console.log(e);
                        //window.alert(`Error updating account states: ${e.toString()}`);
                    }
                }
            }
        });
    }

    useEffect(() => {
        const interval2 = setInterval(() => {
            getUpdateForAccounts();
        }, 2000);

        return (() => {
            log(`Clearing interval`);
            clearInterval(interval2);
        });
    }, []);

    // =================================================================================================================
    //
    //   accounts datagrid
    //
    // =================================================================================================================

    const accountSelectionColumns = [
        { field: "id", headerName: "ID", flex: 0.5 },
        {
            field: "description",
            headerName: "Description",
            flex: 1,
            cellClassName: "description-column--cell"
        },
        {
            field: "address",
            headerName: "Address",
            flex: 1,
        },
        {
            field: "balance",
            headerName: "Balance",
            flex: 1,
        },
        {
            field: "nonce",
            headerName: "Nonce",
            flex: 1,
        },
        {
            field: "sent",
            headerName: "Sent",
            flex: 1,
        },
        {
            field: "pending",
            headerName: "Pending",
            flex: 1,
        },
        {
            field: "confirmed",
            headerName: "Confirmed",
            flex: 1,
        },
    ];

    if(useTargetToken) {
        accountSelectionColumns.push({
            field: "tokenBalance",
            headerName: "Tokens",
            flex: 1,
        });
    }

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
            <DataGrid
                // rows={useContext(SwapParamsContext).swapParams}
                checkboxSelection
                rows={rows}
                columns={accountSelectionColumns}
                rowSelectionModel={selectionModel}
                // onSelectionModelChange={() => {
                //     setSelectionModel
                // }}
                onRowSelectionModelChange={(rowSelectionModel, details) => {
                    console.log("row selection model changed");
                    console.log(rowSelectionModel);

                    for(const id of rowSelectionModel) {
                        const account = accounts[id];
                        console.log(`Account ${account.address} is selected`);
                    }

                    updateSelectedAccounts(rowSelectionModel);  // external
                    setSelectionModel(rowSelectionModel);  // internal
                    //setSettingsValidated(false);  // put in updateSelectedAccounts
                }}
            />
        </Box>
    );
}

export default AccountsUpdater;
