import {Box, Button, Typography, useTheme} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import Header from '../../../components/Header';
import useSessionStorage from "../../../utils/useSessionStorage";
import {useNavigate} from "react-router-dom";

const SnipeSessions = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [snipeSessionSettings, setSnipeSessionSettings] = useSessionStorage('snipeSessionSettings', []);

    // TODO - remove
    //setSnipeSessionSettings([]);

    const navigate = useNavigate();

    const handleEdit = (id) => {
        console.log(`Edit clicked ${id}`);

        navigate(
            '/session',
            { state: { loadId: id, loadMode: 'edit', origin: 'sessions' } }
        );
    }

    const handleDelete = (_id, description) => {
        if(window.confirm(`Are you sure you want to delete snipe session ${_id} with description: \n '${description}'?`)) {
            let index = -1;
            const snipeSessionSettingsClone = [...snipeSessionSettings];

            for(let i = 0; i < snipeSessionSettingsClone.length; i++) {
                const { id } = snipeSessionSettingsClone[i];

                if(parseInt(_id) === parseInt(id)) {
                    index = i;
                    break;
                }
            }

            if(index !== -1) {
                console.log(snipeSessionSettingsClone);
                snipeSessionSettingsClone.splice(index, 1);
                setSnipeSessionSettings(snipeSessionSettingsClone);
            }

            navigate(
                '/sessions',
            );
        }
    }

    const handleDuplicate = (id) => {
        console.log(`Duplicate clicked ${id}`);

        navigate(
            '/session',
            { state: { loadId: id, loadMode: 'duplicate', origin: 'sessions', } }
        );
    }

    const handleClearPresets = () => {
        if(window.confirm(`ARE YOU SURE YOU WANT TO CLEAR BROWSER STORAGE FOR SNIPE SESSIONS?\n\nTHIS WILL DELETE ALL SAVED SNIPE SESSIONS.`)) {
            setSnipeSessionSettings([]);
            window.alert(`Storage for snipe sessions reset back to defaults`);
            navigate('/sessions',);
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
        {
            field: "tokenContractAddress",
            headerName: "Token Address",
            flex: 1,
        },
        {
            field: "tokenContractName",
            headerName: "Token Name",
            flex: 1,
        },

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
                            View
                        </Button>
                        <Button color="secondary" variant="contained" ml="5px" mr="5px" p="5px" onClick={() => { handleDelete(id, description) }}>
                            Delete
                        </Button>
                        <Button color="secondary" variant="contained" ml="5px" mr="5px" p="5px" onClick={() => { handleDuplicate(id) }}>
                            Copy
                        </Button>
                    </Box>
                )
            }
        },
    ];

    return (
        <Box m="20px">
            <Header title="SNIPE SESSIONS" subtitle="List of existing Snipe Sessions"/>
            <Box display="flex" justifyContent="left" mt="10px" p="10px">
                <Button type="submit" color="secondary" variant="contained" sx={{ ml: 1 }} onClick={() => {
                    navigate(
                        '/session',
                        { state: { loadMode: 'new', origin: 'sessions', } }
                    );
                }}>
                    Create New Snipe Session
                </Button>

                <Button color="warning" variant="contained" sx={{ ml: 1 }} onClick={() => {
                    handleClearPresets();
                }}>
                    Clear Snipe Sessions
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
                    rows={snipeSessionSettings}
                    columns={columns}
                />
            </Box>
        </Box>
    );
}

export default SnipeSessions;

