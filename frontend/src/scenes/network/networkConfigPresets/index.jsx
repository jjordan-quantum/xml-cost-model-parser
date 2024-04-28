import {Box, Button, useTheme} from "@mui/material";
import {tokens} from "../../../theme";
import useSessionStorage from "../../../utils/useSessionStorage";
import {useNavigate} from "react-router-dom";
import Header from "../../../components/Header";
import {DataGrid} from "@mui/x-data-grid";
import defaultNetworkConfigPresets, {
    defaultNetworkConfigDescriptions, ensureDefaults
} from "../../../data/defaults/defaultNetworkConfigPresets";

const NetworkConfigPresets = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [networkConfigs, setNetworkConfigs] = useSessionStorage('networkConfigs', defaultNetworkConfigPresets);
    const navigate = useNavigate();

    if(networkConfigs.length === 0) {
        setNetworkConfigs(defaultNetworkConfigPresets);
    }

    ensureDefaults(networkConfigs, setNetworkConfigs);

    const handleEdit = (id) => {
        // console.log(`Edit clicked ${id}`);

        navigate(
            '/network-config',
            { state: { loadId: id, loadMode: 'edit', origin: 'presets' } }
        );
    }

    const handleDelete = (_id, description) => {
        console.log(`Delete clicked ${_id}`);

        if(defaultNetworkConfigDescriptions.includes(description)) {
            window.alert("Cannot delete default presets");
            return;
        }

        if(window.confirm(`Are you sure you want to delete the preset ${_id} with description: \n '${description}'?`)) {
            let index = -1;
            const networkConfigsClone = [...networkConfigs];

            for(let i = 0; i < networkConfigsClone.length; i++) {
                const { id } = networkConfigsClone[i];

                if(parseInt(_id) === parseInt(id)) {
                    index = i;
                    break;
                }
            }

            if(index !== -1) {
                console.log(networkConfigsClone);
                networkConfigsClone.splice(index, 1);
                setNetworkConfigs(networkConfigsClone);
            }

            navigate(
                '/network-config-presets',
            );
        }
    }

    const handleDuplicate = (id) => {
        console.log(`Duplicate clicked ${id}`);

        navigate(
            '/network-config',
            { state: { loadId: id, loadMode: 'duplicate', origin: 'presets' } }
        );
    }

    const handleClearPresets = () => {
        if(window.confirm(`ARE YOU SURE YOU WANT TO CLEAR BROWSER STORAGE FOR NETWORK CONFIGS?\n\nTHIS WILL DELETE ALL SAVED PRESETS AND LEAVE ONLY THE DEFAULTS.`)) {
            setNetworkConfigs(defaultNetworkConfigPresets);
            window.alert(`Storage for network configs reset back to defaults`);
            navigate('/network-config-presets');
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
        {
            field: "chainId",
            headerName: "Chain ID",
            type: "number",
            headerAlign: "left",
            align: "left",
        },
        {
            field: "avgBlockTimeMs",
            headerName: "Avg Block Time (ms)",
            flex: 1,
        },

        {
            field: "hasEip1559Support",
            headerName: "Type 2 Txns",
            flex: 1,
        },

        {
            field: "hasWebsockets",
            headerName: "Websockets",
            flex: 1,
        },
        {
            field: "hasMempool",
            headerName: "Mempool",
            flex: 1,
        },
        {
            field: "frontRunningIsAllowed",
            headerName: "Front Running",
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
            <Header title="NETWORK CONFIG PRESETS" subtitle="List of existing presets for Network Configs"/>
            <Box display="flex" justifyContent="left" mt="10px" p="10px">
                <Button
                    type="submit"
                    color="secondary"
                    variant="contained"
                    sx={{ ml: 1 }}
                    onClick={() => {
                        navigate(
                            '/network-config',
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
                    rows={networkConfigs}
                    columns={columns}
                />
            </Box>
        </Box>
    );
}

export default NetworkConfigPresets;