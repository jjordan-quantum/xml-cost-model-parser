import {Box, Button, Typography, useTheme} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import Header from '../../../components/Header';
import useSessionStorage from "../../../utils/useSessionStorage";
import {useNavigate} from "react-router-dom";

const CodeNumbers = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [codeNumbers, setCodeNumbers] = useSessionStorage('codeNumbers', []);
    const navigate = useNavigate();

    const handleEdit = (id) => {
        console.log(`Edit clicked ${id}`);

        navigate(
            '/code-number',
            { state: { loadId: id, loadMode: 'edit', origin: 'code-numbers' } }
        );
    }

    const handleDelete = (_id, description) => {
        console.log(`Delete clicked ${_id}`);

        if(window.confirm(`Are you sure you want to delete the preset ${_id} with description: \n '${description}'?`)) {
            let index = -1;
            const codeNumbersClone = [...codeNumbers];

            for(let i = 0; i < codeNumbersClone.length; i++) {
                const { id } = codeNumbersClone[i];

                if(parseInt(_id) === parseInt(id)) {
                    index = i;
                    break;
                }
            }

            if(index !== -1) {
                console.log(codeNumbersClone);
                codeNumbersClone.splice(index, 1);
                setCodeNumbers(codeNumbersClone);
            }

            navigate(
                '/code-numbers',
            );
        }
    }

    const handleDuplicate = (id) => {
        console.log(`Duplicate clicked ${id}`);

        navigate(
            '/code-number',
            { state: { loadId: id, loadMode: 'duplicate', origin: 'code-numbers' } }
        );
    }

    const handleClearPresets = () => {
        if(window.confirm(`ARE YOU SURE YOU WANT TO CLEAR BROWSER STORAGE FOR CODE NUMBERS?\n\nTHIS WILL DELETE ALL PRESETS.`)) {
            setCodeNumbers([]);
            window.alert(`Storage for code numbers reset back to defaults`);
            navigate('/code-numbers',);
        }
    }

    const columns = [
        { field: "id", headerName: "ID" },
        {
            field: "codeCategoryNumber",
            headerName: "Division Number",
            flex: 1,
        },
        {
            field: "codeCategory",
            headerName: "Division",
            flex: 1,
        },
        {
            field: "codeSubCategoryNumber",
            headerName: "Category Number",
            flex: 1,
        },
        {
            field: "codeSubCategory",
            headerName: "Code Category",
            flex: 1,
        },
        {
            field: "codeNumber",
            headerName: "Code Number",
            flex: 1,
        },
        {
            field: "codeName",
            headerName: "Code Name",
            flex: 1,
        },
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
            <Header title="CODE NUMBERS" subtitle="List of existing presets for Code Numbers"/>
            <Box display="flex" justifyContent="left" mt="10px" p="10px">
                <Button type="submit" color="secondary" variant="contained" sx={{ ml: 1 }} onClick={() => {
                    navigate(
                        '/code-number',
                        { state: { loadMode: 'new', origin: 'code-numbers' } }
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
                    rows={codeNumbers}
                    columns={columns}
                />
            </Box>
        </Box>
    );
}

export default CodeNumbers;

