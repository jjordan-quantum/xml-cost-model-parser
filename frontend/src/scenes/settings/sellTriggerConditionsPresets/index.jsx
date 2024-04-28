import {Box, Button, Typography, useTheme} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import Header from '../../../components/Header';
import useSessionStorage from "../../../utils/useSessionStorage";
import {useNavigate} from "react-router-dom";

const SellTriggerConditionsPresets = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [sellTriggerConditions, setSellTriggerConditions] = useSessionStorage('sellTriggerConditions', []);
    const navigate = useNavigate();

    const handleEdit = (id) => {
        console.log(`Edit clicked ${id}`);

        navigate(
            '/sell-trigger-conditions',
            { state: { loadId: id, loadMode: 'edit', origin: 'presets' } }
        );
    }

    const handleDelete = (_id, description) => {
        console.log(`Delete clicked ${_id}`);

        if(window.confirm(`Are you sure you want to delete the preset ${_id} with description: \n '${description}'?`)) {
            let index = -1;
            const sellTriggerConditionsClone = [...sellTriggerConditions];

            for(let i = 0; i < sellTriggerConditionsClone.length; i++) {
                const { id } = sellTriggerConditionsClone[i];

                if(parseInt(_id) === parseInt(id)) {
                    index = i;
                    break;
                }
            }

            if(index !== -1) {
                console.log(sellTriggerConditionsClone);
                sellTriggerConditionsClone.splice(index, 1);
                setSellTriggerConditions(sellTriggerConditionsClone);
            }

            navigate(
                '/sell-trigger-conditions-presets',
            );
        }
    }

    const handleDuplicate = (id) => {
        console.log(`Duplicate clicked ${id}`);

        navigate(
            '/sell-trigger-conditions',
            { state: { loadId: id, loadMode: 'duplicate', origin: 'presets' } }
        );
    }

    const handleClearPresets = () => {
        if(window.confirm(`ARE YOU SURE YOU WANT TO CLEAR BROWSER STORAGE FOR SELL TRIGGER CONDITIONS?\n\nTHIS WILL DELETE ALL PRESETS.`)) {
            setSellTriggerConditions([]);
            window.alert(`Storage for sell trigger conditions reset back to defaults`);
            navigate('/sell-trigger-conditions-presets',);
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
            field: "autoApproveRouter",
            headerName: "Auto-Approve Router",
            flex: 1,
        },
        {
            field: "frontunRemoveLiquidityTxn",
            headerName: "Frontrun Remove Liquidity Tx",
            flex: 1,
        },
        {
            field: "frontrunHpActivationTxn",
            headerName: "Frontrun HP Activation Tx",
            flex: 1,
        },
        {
            field: "sellTargetTokensAtPriceGain",
            headerName: "Sell Tokens at Target Price Gain",
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
            <Header title="SELL TRIGGER CONDITIONS PRESETS" subtitle="List of existing presets for Sell Trigger Conditions"/>
            <Box display="flex" justifyContent="left" mt="10px" p="10px">
                <Button type="submit" color="secondary" variant="contained" sx={{ ml: 1 }} onClick={() => {
                    navigate(
                        '/sell-trigger-conditions',
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
                    rows={sellTriggerConditions}
                    columns={columns}
                />
            </Box>
        </Box>
    );
}

export default SellTriggerConditionsPresets;

