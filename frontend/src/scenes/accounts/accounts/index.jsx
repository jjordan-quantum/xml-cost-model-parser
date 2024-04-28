import {Box, Button, Typography, useTheme} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import Header from '../../../components/Header';
import useSessionStorage from "../../../utils/useSessionStorage";
import {useNavigate} from "react-router-dom";
import defaultAccounts, {
    defaultAccountDescriptions,
    ensureDefaultAccounts
} from "../../../data/defaults/defaultAccounts";

const Accounts = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [accounts, setAccounts] = useSessionStorage('accounts', defaultAccounts);
    ensureDefaultAccounts(accounts, setAccounts);
    const navigate = useNavigate();

    const handleEdit = (id) => {
        console.log(`Edit clicked ${id}`);

        navigate(
            '/account',
            { state: { loadId: id, loadMode: 'edit', origin: 'accounts' } }
        );
    }

    const handleDelete = (_id, description) => {
        console.log(`Delete clicked ${_id}`);

        if(defaultAccountDescriptions.includes(description)) {
            window.alert("Cannot delete default account");
            return;
        }

        if(window.confirm(`Are you sure you want to delete the preset ${_id} with description: \n '${description}'?`)) {
            let index = -1;
            const accountsClone = [...accounts];

            for(let i = 0; i < accountsClone.length; i++) {
                const { id } = accountsClone[i];

                if(parseInt(_id) === parseInt(id)) {
                    index = i;
                    break;
                }
            }

            if(index !== -1) {
                console.log(accountsClone);
                accountsClone.splice(index, 1);
                setAccounts(accountsClone);
            }

            navigate(
                '/accounts',
            );
        }
    }

    const handleDuplicate = (id) => {
        console.log(`Duplicate clicked ${id}`);

        navigate(
            '/account',
            { state: { loadId: id, loadMode: 'duplicate' } }
        );
    }

    const handleClearPresets = () => {
        if(window.confirm(`ARE YOU SURE YOU WANT TO CLEAR BROWSER STORAGE FOR ACCOUNTS?\n\nTHIS WILL DELETE ALL SAVED ACCOUNTS.`)) {
            setAccounts(defaultAccounts);
            window.alert(`Storage for accounts reset back to defaults`);
            navigate('/accounts',);
        }
    }

    const columns = [
        { field: "id", headerName: "ID" },
        {
            field: "description",
            headerName: "Description",
            flex: 1,
            cellClassName: "description-column--cell"
        },
        // {
        //     field: "age",
        //     headerName: "Age",
        //     type: "number",
        //     headerAlign: "left",
        //     align: "left",
        // },
        // {
        //     field: "privateKey",
        //     headerName: "Private Key",
        //     flex: 1,
        // },
        {
            field: "address",
            headerName: "Address",
            flex: 1,
        },
        // {
        //     field: "maxGasPriceForFrontRunning",
        //     headerName: "Max Gas Price for Frontrunning",
        //     flex: 1,
        // },
        // {
        //     field: "onlyFrontRunSimilar",
        //     headerName: "Only frontrun txns for same snipe",
        //     flex: 1,
        // },
        {
            field: "fee",
            headerName: "Actions",
            flex: 1,
            renderCell: ({ row: { id, description } }) => {
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
                        <Button color="secondary" variant="contained" ml="5px" mr="5px" p="5px" onClick={() => { handleEdit(id) }}>
                            Edit
                        </Button>
                        <Button color="secondary" variant="contained" ml="5px" mr="5px" p="5px" onClick={() => { handleDelete(id, description) }}>
                            Delete
                        </Button>
                        {/*<Button color="secondary" variant="contained" ml="5px" mr="5px" p="5px" onClick={() => { handleDuplicate(id) }}>*/}
                        {/*    Copy*/}
                        {/*</Button>*/}
                    </Box>
                )
            }
        },
    ];

    return (
        <Box m="20px">
            <Header title="ACCOUNTS" subtitle="List of saved acounts"/>
            <Box display="flex" justifyContent="left" mt="10px" p="10px">
                <Button type="submit" color="secondary" variant="contained" sx={{ ml: 1 }} onClick={() => { navigate('/account') }}>
                    Add New Account
                </Button>

                <Button color="warning" variant="contained" sx={{ ml: 1 }} onClick={() => {
                    handleClearPresets();
                }}>
                    Clear Accounts
                </Button>
            </Box>
            <Box
                m="40px 0 0 0"
                height="70vh"
                sx={{
                    "& .MuiDataGrid-root": {
                        border: "none",
                    },
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
                }}
            >
                <DataGrid
                    // rows={useContext(SwapParamsContext).swapParams}
                    rows={accounts}
                    columns={columns}
                />
            </Box>
        </Box>
    );
}

export default Accounts;
