import {Box, Button, Typography, useTheme} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import Header from '../../../components/Header';
import useSessionStorage from "../../../utils/useSessionStorage";
import {useNavigate} from "react-router-dom";

const BotSnipeTriggerConditionsPresets = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [botSnipeTriggerConditions, setBotSnipeTriggerConditions] = useSessionStorage('botSnipeTriggerConditions', []);
    const navigate = useNavigate();

    const handleEdit = (id) => {
        console.log(`Edit clicked ${id}`);

        navigate(
            '/bot-snipe-trigger-conditions',
            { state: { loadId: id, loadMode: 'edit', origin: 'presets' } }
        );
    }

    const handleDelete = (_id, description) => {
        console.log(`Delete clicked ${_id}`);

        if(window.confirm(`Are you sure you want to delete the preset ${_id} with description: \n '${description}'?`)) {
            let index = -1;
            const snipeTriggerConditionsClone = [...botSnipeTriggerConditions];

            for(let i = 0; i < snipeTriggerConditionsClone.length; i++) {
                const { id } = snipeTriggerConditionsClone[i];

                if(parseInt(_id) === parseInt(id)) {
                    index = i;
                    break;
                }
            }

            if(index !== -1) {
                console.log(snipeTriggerConditionsClone);
                snipeTriggerConditionsClone.splice(index, 1);
                setBotSnipeTriggerConditions(snipeTriggerConditionsClone);
            }

            navigate(
                '/bot-snipe-trigger-conditions-presets',
            );
        }
    }

    const handleDuplicate = (id) => {
        console.log(`Duplicate clicked ${id}`);

        navigate(
            '/bot-snipe-trigger-conditions',
            { state: { loadId: id, loadMode: 'duplicate', origin: 'presets' } }
        );
    }

    const handleClearPresets = () => {
        if(window.confirm(`ARE YOU SURE YOU WANT TO CLEAR BROWSER STORAGE FOR BOT SNIPE TRIGGER CONDITIONS?\n\nTHIS WILL DELETE ALL PRESETS.`)) {
            setBotSnipeTriggerConditions([]);
            window.alert(`Storage for bot snipe trigger conditions reset back to defaults`);
            navigate('/bot-snipe-trigger-conditions-presets',);
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
            field: "maxOutputLimitFinderLowerBounds",
            headerName: "Limit Finder Lower Bounds",
            flex: 1,
        },
        {
            field: "maxOutputLimitFinderUpperBounds",
            headerName: "Limit Finder Upper Bounds",
            flex: 1,
        },
        {
            field: "maxOutputLimitFinderIncrement",
            headerName: "Limit Finder Increment",
            flex: 1,
        },
        {
            field: "detectLiquidityTransaction",
            headerName: "Detect Liquidity Txn",
            flex: 1,
        },
        {
            field: "useHypeTokenFilter",
            headerName: "Use Hype Token Filter",
            flex: 1,
        },
        {
            field: "honeypotDetectionTaxThreshold",
            headerName: "HoneyPot Tax Threshold",
            flex: 1,
        },
        {
            field: "useMaxPriceImpact",
            headerName: "Use Max Price Impact",
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
            <Header title="BOT SNIPE TRIGGER CONDITIONS PRESETS" subtitle="List of existing presets for Bot Snipe Trigger Conditions"/>
            <Box display="flex" justifyContent="left" mt="10px" p="10px">
                <Button type="submit" color="secondary" variant="contained" sx={{ ml: 1 }} onClick={() => {
                    navigate(
                        '/bot-snipe-trigger-conditions',
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
                    rows={botSnipeTriggerConditions}
                    columns={columns}
                />
            </Box>
        </Box>
    );
}

export default BotSnipeTriggerConditionsPresets;

