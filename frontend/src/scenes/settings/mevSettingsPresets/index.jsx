import {Box, Button, Typography, useTheme} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import Header from '../../../components/Header';
import useSessionStorage from "../../../utils/useSessionStorage";
import {useNavigate} from "react-router-dom";

const MevSettingsPresets = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [mevSettings, setMevSettings] = useSessionStorage('mevSettings', []);
    const navigate = useNavigate();

    const handleEdit = (id) => {
        console.log(`Edit clicked ${id}`);

        navigate(
            '/mev-settings',
            { state: { loadId: id, loadMode: 'edit', origin: 'presets' } }
        );
    }

    const handleDelete = (_id, description) => {
        console.log(`Delete clicked ${_id}`);

        if(window.confirm(`Are you sure you want to delete the preset ${_id} with description: \n '${description}'?`)) {
            let index = -1;
            const mevSettingsClone = [...mevSettings];

            for(let i = 0; i < mevSettingsClone.length; i++) {
                const { id } = mevSettingsClone[i];

                if(parseInt(_id) === parseInt(id)) {
                    index = i;
                    break;
                }
            }

            if(index !== -1) {
                console.log(mevSettingsClone);
                mevSettingsClone.splice(index, 1);
                setMevSettings(mevSettingsClone);
            }

            navigate(
                '/mev-settings-presets',
            );
        }
    }

    const handleDuplicate = (id) => {
        console.log(`Duplicate clicked ${id}`);

        navigate(
            '/mev-settings',
            { state: { loadId: id, loadMode: 'duplicate', origin: 'presets' } }
        );
    }

    const handleClearPresets = () => {
        if(window.confirm(`ARE YOU SURE YOU WANT TO CLEAR BROWSER STORAGE FOR MEV SETTINGS?\n\nTHIS WILL DELETE ALL PRESETS.`)) {
            setMevSettings([]);
            window.alert(`Storage for MEV settings reset back to defaults`);
            navigate('/mev-settings-presets',);
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
            field: "mevContractAddress",
            headerName: "MEV Contract Address",
            flex: 1,
        },
        // {
        //     field: "mevDeployerPrivateKey",
        //     headerName: "MEV Deployer Acct",
        //     flex: 1,
        // },
        {
            field: "useMevWithSameBlockSnipe",
            headerName: "Use Same Block MEV",
            flex: 1,
        },
        {
            field: "sendAdditionalMevBundleSameBlockSnipe",
            headerName: "Use Non-Positional Bundle",
            flex: 1,
        },
        {
            field: "useMevWithSecondBlockSnipe",
            headerName: "Use Second Block MEV",
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
            <Header title="MEV SETTINGS PRESETS" subtitle="List of existing presets for MEV Settings"/>
            <Box display="flex" justifyContent="left" mt="10px" p="10px">
                <Button type="submit" color="secondary" variant="contained" sx={{ ml: 1 }} onClick={() => {
                    navigate(
                        '/mev-settings',
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
                    rows={mevSettings}
                    columns={columns}
                />
            </Box>
        </Box>
    );
}

export default MevSettingsPresets;

