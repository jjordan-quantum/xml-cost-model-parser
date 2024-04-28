import {Box, Button, Typography, useTheme} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import Header from '../../../components/Header';
import useSessionStorage from "../../../utils/useSessionStorage";
import {useNavigate} from "react-router-dom";

const Features = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [features, setFeatures] = useSessionStorage('features', []);
    const navigate = useNavigate();

    const handleEdit = (id) => {
        console.log(`Edit clicked ${id}`);

        navigate(
            '/feature',
            { state: { loadId: id, loadMode: 'edit', origin: 'features' } }
        );
    }

    const handleDelete = (_id, description) => {
        console.log(`Delete clicked ${_id}`);

        if(window.confirm(`Are you sure you want to delete the preset ${_id} with description: \n '${description}'?`)) {
            let index = -1;
            const featuresClone = [...features];

            for(let i = 0; i < featuresClone.length; i++) {
                const { id } = featuresClone[i];

                if(parseInt(_id) === parseInt(id)) {
                    index = i;
                    break;
                }
            }

            if(index !== -1) {
                console.log(featuresClone);
                featuresClone.splice(index, 1);
                setFeatures(featuresClone);
            }

            navigate(
                '/features',
            );
        }
    }

    const handleDuplicate = (id) => {
        console.log(`Duplicate clicked ${id}`);

        navigate(
            '/feature',
            { state: { loadId: id, loadMode: 'duplicate', origin: 'features' } }
        );
    }

    const handleClearPresets = () => {
        if(window.confirm(`ARE YOU SURE YOU WANT TO CLEAR BROWSER STORAGE FOR FEATURES?\n\nTHIS WILL DELETE ALL PRESETS.`)) {
            setFeatures([]);
            window.alert(`Storage for features reset back to defaults`);
            navigate('/features');
        }
    }

    const columns = [
        { field: "id", headerName: "ID" },
        {
            field: "featureType",
            headerName: "Type",
            flex: 1,
        },
        {
            field: "description",
            headerName: "Description",
            flex: 1,
            cellClassName: "description-column--cell"
        },
        {
            field: "featureCode",
            headerName: "Code Number",
            flex: 1,
        },
        {
            field: "codeName",
            headerName: "Feature Code",
            flex: 1,
        },
        {
            field: "productionQuantity",
            headerName: "Qty",
            flex: 1,
        },
        {
            field: "productionQuantityUnits",
            headerName: "Units",
            flex: 1,
        },
        {
            field: "productionRate",
            headerName: "Production Rate",
            flex: 1,
        },
        {
            field: "productionDurationPerUnit",
            headerName: "Per Unit",
            flex: 1,
        },
        {
            field: "productionRateUnits",
            headerName: "Rate Units",
            flex: 1,
        },
        // {
        //     field: "age",
        //     headerName: "Age",
        //     type: "number",
        //     headerAlign: "left",
        //     align: "left",
        // },
        {
            field: "blank",
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
            <Header title="FEATURES" subtitle="List of existing presets for Features"/>
            <Box display="flex" justifyContent="left" mt="10px" p="10px">
                <Button type="submit" color="secondary" variant="contained" sx={{ ml: 1 }} onClick={() => {
                    navigate(
                        '/feature',
                        { state: { loadMode: 'new', origin: 'features' } }
                    ) ;
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
                    rows={features}
                    columns={columns}
                />
            </Box>
        </Box>
    );
}

export default Features;

