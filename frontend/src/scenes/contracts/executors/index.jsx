import {Box, Button, Typography, useTheme} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import Header from '../../../components/Header';
import useSessionStorage from "../../../utils/useSessionStorage";
import {useNavigate} from "react-router-dom";

const Executors = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [executors, setExecutors] = useSessionStorage('executors', []);
    const navigate = useNavigate();

    const handleEdit = (id) => {
        console.log(`Edit clicked ${id}`);

        navigate(
            '/executor',
            { state: { loadId: id, loadMode: 'edit', origin: 'executors' } }
        );
    }

    const handleDelete = (_id, description) => {
        console.log(`Delete clicked ${_id}`);

        if(window.confirm(`Are you sure you want to delete the executor ${_id} with description: \n '${description}'?`)) {
            let index = -1;
            const executorsClone = [...executors];

            for(let i = 0; i < executorsClone.length; i++) {
                const { id } = executorsClone[i];

                if(parseInt(_id) === parseInt(id)) {
                    index = i;
                    break;
                }
            }

            if(index !== -1) {
                console.log(executorsClone);
                executorsClone.splice(index, 1);
                setExecutors(executorsClone);
            }

            navigate(
                '/executors',
            );
        }
    }

    const handleDuplicate = (id) => {
        console.log(`Duplicate clicked ${id}`);

        navigate(
            '/executor',
            { state: { loadId: id, loadMode: 'duplicate', origin: 'executors' } }
        );
    }

    const handleClearPresets = () => {
        if(window.confirm(`ARE YOU SURE YOU WANT TO CLEAR BROWSER STORAGE FOR EXECUTOR CONTRACTS?\n\nTHIS WILL DELETE ALL SAVED EXECUTORS.`)) {
            setExecutors([]);
            window.alert(`Storage for executors reset back to defaults`);
            navigate('/executors',);
        }
    }

    const columns = [
        { field: "id", headerName: "ID" },
        {
            field: "chainId",
            headerName: "Chain ID",
            flex: 1,
            cellClassName: "description-column--cell"
        },
        {
            field: "description",
            headerName: "Description",
            flex: 1,
            cellClassName: "description-column--cell"
        },
        {
            field: "executorContractAddress",
            headerName: "Address",
            flex: 1,
        },
        {
            field: "deployerAddress",
            headerName: "Deployer",
            flex: 1,
        },
        {
            field: "version",
            headerName: "Version",
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
            <Header title="EXECUTOR CONTRACTS" subtitle="List of saved Executor Contracts"/>
            <Box display="flex" justifyContent="left" mt="10px" p="10px">
                <Button type="submit" color="secondary" variant="contained" onClick={() => {
                    navigate(
                        '/executor',
                        { state: { loadMode: 'new', origin: 'executors' } }
                    )
                }}>
                    Add or Deploy New Executor
                </Button>

                <Button color="warning" variant="contained" sx={{ ml: 1 }} onClick={() => {
                    handleClearPresets();
                }}>
                    Clear Executors
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
                    rows={executors}
                    columns={columns}
                />
            </Box>
        </Box>
    );
}

export default Executors;
