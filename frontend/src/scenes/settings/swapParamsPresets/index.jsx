import {Box, Button, Typography, useTheme} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import Header from '../../../components/Header';
import useSessionStorage from "../../../utils/useSessionStorage";
import {useNavigate} from "react-router-dom";
import {defaultSwapParamsDescriptions, ensureDefaultSwapParams} from "../../../data/defaults/defaultSwapParamsPresets";

const SwapParamsPreset = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [swapParams, setSwapParams] = useSessionStorage('swapParams', []);
    const navigate = useNavigate();

    ensureDefaultSwapParams(swapParams, setSwapParams);

    const handleEdit = (id) => {
        console.log(`Edit clicked ${id}`);

        navigate(
            '/swap-params',
            { state: { loadId: id, loadMode: 'edit', origin: 'presets' } }
        );
    }

    const handleDelete = (_id, description) => {
        console.log(`Delete clicked ${_id}`);

        if(
            !!description
            && (defaultSwapParamsDescriptions.length > 0)
            && defaultSwapParamsDescriptions.includes(description)
        ) {
            window.alert("Cannot delete default presets");
            return;
        }

        if(window.confirm(`Are you sure you want to delete the preset ${_id} with description: \n '${description}'?`)) {
            let index = -1;
            const swapParamsClone = [...swapParams];

            for(let i = 0; i < swapParamsClone.length; i++) {
                const { id } = swapParamsClone[i];

                if(parseInt(_id) === parseInt(id)) {
                    index = i;
                    break;
                }
            }

            if(index !== -1) {
                console.log(`Deleting preset at index ${index}`);
                console.log(swapParams);
                swapParamsClone.splice(index, 1);
                setSwapParams(swapParamsClone);
            } else {
                console.log(`Did not find preset for id`);
            }

            navigate(
                '/swap-params-presets',
            );
        }
    }

    const handleDuplicate = (id) => {
        console.log(`Duplicate clicked ${id}`);

        navigate(
            '/swap-params',
            { state: { loadId: id, loadMode: 'duplicate', origin: 'presets' } }
        );
    }

    const handleClearPresets = () => {
        if(window.confirm(`ARE YOU SURE YOU WANT TO CLEAR BROWSER STORAGE FOR SWAP PARAMETERS?\n\nTHIS WILL DELETE ALL PRESETS.`)) {
            setSwapParams([]);
            window.alert(`Storage for swap params reset back to defaults`);
            navigate('/swap-params-presets',);
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
            field: "router",
            headerName: "Router / To Address",
            flex: 1,
        },
        {
            field: "useMevExecutor",
            headerName: "Use MEV Executor",
            flex: 1,
        },
        {
            field: "useSpecificInput",
            headerName: "Use Specific Tx Input",
            flex: 1,
        },
        {
            field: "functionSelect",
            headerName: "Function Select",
            flex: 1,
        },
        {
            field: "txValue",
            headerName: "Tx Value",
            flex: 1,
        },
        {
            field: "useSlippage",
            headerName: "Using Slippage",
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
                            Edit
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
            <Header title="SWAP PARAMETERS PRESETS" subtitle="List of existing presets for Swap Parameters"/>
            <Box display="flex" justifyContent="left" mt="10px" p="10px">
                <Button type="submit" color="secondary" variant="contained" sx={{ ml: 1 }} onClick={() => {
                    navigate(
                        '/swap-params',
                        { state: { loadMode: 'new', origin: 'presets' } }
                    );
                }}>
                    Create New Preset
                </Button>

                <Button color="warning" variant="contained" sx={{ ml: 1 }} onClick={() => {
                    handleClearPresets();
                }}>
                    Clear Presets
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
                    rows={swapParams}
                    columns={columns}
                />
            </Box>
        </Box>
    );
}

export default SwapParamsPreset;

