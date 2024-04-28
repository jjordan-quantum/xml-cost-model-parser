import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import BackupTableOutlinedIcon from '@mui/icons-material/BackupTableOutlined';
import CrisisAlertOutlinedIcon from '@mui/icons-material/CrisisAlertOutlined';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';

const Item = ({ title, to, icon, selected, setSelected }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <MenuItem
            active={selected === title}
            style={{
                color: colors.grey[100],
            }}
            onClick={() => setSelected(title)}
            icon={icon}
        >
            <Typography>{title}</Typography>
            <Link to={to} />
        </MenuItem>
    );
};

const Sidebar = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selected, setSelected] = useState("Dashboard");

    return (
        <Box
            sx={{
                "& .pro-sidebar-inner": {
                    background: `${colors.primary[400]} !important`,
                },
                "& .pro-icon-wrapper": {
                    backgroundColor: "transparent !important",
                },
                "& .pro-inner-item": {
                    padding: "5px 35px 5px 20px !important",
                },
                "& .pro-inner-item:hover": {
                    color: "#868dfb !important",
                },
                "& .pro-menu-item.active": {
                    color: "#6870fa !important",
                },
            }}
        >
            <ProSidebar collapsed={isCollapsed}>
                <Menu iconShape="square">
                    {/* LOGO AND MENU ICON */}
                    <MenuItem
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
                        style={{
                            margin: "10px 0 20px 0",
                            color: colors.grey[100],
                        }}
                    >
                        {!isCollapsed && (
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                ml="15px"
                            >
                                <Typography variant="h3" color={colors.grey[100]}>
                                    MENU
                                </Typography>
                                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                                    <MenuOutlinedIcon />
                                </IconButton>
                            </Box>
                        )}
                    </MenuItem>

                    {!isCollapsed && (
                        <Box mb="25px">
                            <Box display="flex" justifyContent="center" alignItems="center">
                                <img
                                    alt="profile-user"
                                    width="100px"
                                    height="100px"
                                    src={`../../assets/eth.png`}
                                    style={{ cursor: "pointer", borderRadius: "50%" }}
                                />
                            </Box>
                            <Box textAlign="center">
                                <Typography
                                    variant="h2"
                                    color={colors.grey[100]}
                                    fontWeight="bold"
                                    sx={{ m: "10px 0 0 0" }}
                                >
                                    Estimator
                                </Typography>
                                <Typography variant="h5" color={colors.greenAccent[500]}>
                                    App Administration
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    <Box paddingLeft={isCollapsed ? undefined : "10%"}>
                        {/*<Item*/}
                        {/*    title="Dashboard"*/}
                        {/*    to="/"*/}
                        {/*    icon={<HomeOutlinedIcon />}*/}
                        {/*    selected={selected}*/}
                        {/*    setSelected={setSelected}*/}
                        {/*/>*/}
                        <Item
                            title="Environment"
                            to="/environment"
                            icon={<BackupTableOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />
                        <Item
                            title="Snipe Sessions"
                            to="/sessions"
                            icon={<CrisisAlertOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />
                        <Item
                            title="Bot Management"
                            to="/autobots"
                            icon={<SmartToyOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        {/*<Typography*/}
                        {/*    variant="h6"*/}
                        {/*    color={colors.grey[300]}*/}
                        {/*    sx={{ m: "15px 0 5px 20px" }}*/}
                        {/*>*/}
                        {/*    Network*/}
                        {/*</Typography>*/}

                        {/*<Item*/}
                        {/*    title="Connections"*/}
                        {/*    to="/connections-presets"*/}
                        {/*    icon={<ContactsOutlinedIcon />}*/}
                        {/*    selected={selected}*/}
                        {/*    setSelected={setSelected}*/}
                        {/*/>*/}
                        {/*<Item*/}
                        {/*    title="Network Config"*/}
                        {/*    to="/network-config-presets"*/}
                        {/*    icon={<ToggleOnIcon />}*/}
                        {/*    selected={selected}*/}
                        {/*    setSelected={setSelected}*/}
                        {/*/>*/}
                        {/*<Item*/}
                        {/*    title="Accounts"*/}
                        {/*    to="/accounts"*/}
                        {/*    icon={<PeopleOutlinedIcon />}*/}
                        {/*    selected={selected}*/}
                        {/*    setSelected={setSelected}*/}
                        {/*/>*/}

                        <Typography
                            variant="h6"
                            color={colors.grey[300]}
                            sx={{ m: "15px 0 5px 20px" }}
                        >
                            Projects
                        </Typography>

                        <Item
                            title="Projects"
                            to="/projects"
                            icon={<ReceiptOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Bid Items"
                            to="/bid-items"
                            icon={<ReceiptOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Incidental Items"
                            to="/incidental-items"
                            icon={<ReceiptOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />
                        {/*<Item*/}
                        {/*    title="Routers"*/}
                        {/*    to="/invoices"*/}
                        {/*    icon={<ReceiptOutlinedIcon />}*/}
                        {/*    selected={selected}*/}
                        {/*    setSelected={setSelected}*/}
                        {/*/>*/}
                        {/*<Item*/}
                        {/*    title="Tokens"*/}
                        {/*    to="/invoices"*/}
                        {/*    icon={<ReceiptOutlinedIcon />}*/}
                        {/*    selected={selected}*/}
                        {/*    setSelected={setSelected}*/}
                        {/*/>*/}

                        <Typography
                            variant="h6"
                            color={colors.grey[300]}
                            sx={{ m: "15px 0 5px 20px" }}
                        >
                            Bid Components
                        </Typography>

                        <Item
                            title="Activities"
                            to="/activities"
                            icon={<BackupTableOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Assemblies"
                            to="/assemblies"
                            icon={<BackupTableOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Features"
                            to="/features"
                            icon={<BackupTableOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Typography
                            variant="h6"
                            color={colors.grey[300]}
                            sx={{ m: "15px 0 5px 20px" }}
                        >
                            Codes
                        </Typography>

                        <Item
                            title="Code Numbers"
                            to="/code-numbers"
                            icon={<SettingsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Code Categories"
                            to="/code-sub-categories"
                            icon={<SettingsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Divisions"
                            to="/code-categories"
                            icon={<SettingsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Typography
                            variant="h6"
                            color={colors.grey[300]}
                            sx={{ m: "15px 0 5px 20px" }}
                        >
                            Special Resources
                        </Typography>

                        <Item
                            title="Crews"
                            to="/crews"
                            icon={<ContactsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Rentals"
                            to="/rentals"
                            icon={<ContactsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Subcontracts"
                            to="/subcontracts"
                            icon={<ContactsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Incidental Costs"
                            to="/incidental-costs"
                            icon={<ContactsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Typography
                            variant="h6"
                            color={colors.grey[300]}
                            sx={{ m: "15px 0 5px 20px" }}
                        >
                            Special Resource Types
                        </Typography>

                        <Item
                            title="Crew Types"
                            to="/crew-types"
                            icon={<SettingsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Rental Types"
                            to="/rental-types"
                            icon={<SettingsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Subcontract Types"
                            to="/subcontract-types"
                            icon={<SettingsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Incidental Cost Types"
                            to="/incidental-cost-types"
                            icon={<SettingsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Typography
                            variant="h6"
                            color={colors.grey[300]}
                            sx={{ m: "15px 0 5px 20px" }}
                        >
                            Assigned Resources
                        </Typography>

                        <Item
                            title="Labour"
                            to="/labours"
                            icon={<PeopleOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Equipment"
                            to="/equipments"
                            icon={<PeopleOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Vehicles"
                            to="/vehicles"
                            icon={<PeopleOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Trucks"
                            to="/trucks"
                            icon={<PeopleOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Aggregates"
                            to="/aggregates"
                            icon={<PeopleOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Materials"
                            to="/materials"
                            icon={<PeopleOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Parts"
                            to="/parts"
                            icon={<PeopleOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Typography
                            variant="h6"
                            color={colors.grey[300]}
                            sx={{ m: "15px 0 5px 20px" }}
                        >
                            Base Resource Types
                        </Typography>

                        <Item
                            title="Labour Type"
                            to="/labour-types"
                            icon={<SettingsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Equipment Type"
                            to="/equipment-types"
                            icon={<SettingsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Vehicle Type"
                            to="/vehicle-types"
                            icon={<SettingsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Truck Type"
                            to="/truck-types"
                            icon={<SettingsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Aggregate Type"
                            to="/aggregate-types"
                            icon={<SettingsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Material Type"
                            to="/material-types"
                            icon={<SettingsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Part Type"
                            to="/part-types"
                            icon={<SettingsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Typography
                            variant="h6"
                            color={colors.grey[300]}
                            sx={{ m: "15px 0 5px 20px" }}
                        >
                            Base Resource Classes
                        </Typography>

                        <Item
                            title="Labour Class"
                            to="/labour-classes"
                            icon={<SettingsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Equipment Class"
                            to="/equipment-classes"
                            icon={<SettingsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Vehicle Class"
                            to="/vehicle-classes"
                            icon={<SettingsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Truck Class"
                            to="/truck-classes"
                            icon={<SettingsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Aggregate Class"
                            to="/aggregate-classes"
                            icon={<SettingsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Material Class"
                            to="/material-classes"
                            icon={<SettingsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        <Item
                            title="Part Class"
                            to="/part-classes"
                            icon={<SettingsOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        {/*<Typography*/}
                        {/*    variant="h6"*/}
                        {/*    color={colors.grey[300]}*/}
                        {/*    sx={{ m: "15px 0 5px 20px" }}*/}
                        {/*>*/}
                        {/*    Pages*/}
                        {/*</Typography>*/}

                        {/*<Item*/}
                        {/*    title="Calendar"*/}
                        {/*    to="/calendar"*/}
                        {/*    icon={<CalendarTodayOutlinedIcon />}*/}
                        {/*    selected={selected}*/}
                        {/*    setSelected={setSelected}*/}
                        {/*/>*/}
                        {/*<Item*/}
                        {/*    title="FAQ Page"*/}
                        {/*    to="/faq"*/}
                        {/*    icon={<HelpOutlineOutlinedIcon />}*/}
                        {/*    selected={selected}*/}
                        {/*    setSelected={setSelected}*/}
                        {/*/>*/}

                        {/*<Typography*/}
                        {/*    variant="h6"*/}
                        {/*    color={colors.grey[300]}*/}
                        {/*    sx={{ m: "15px 0 5px 20px" }}*/}
                        {/*>*/}
                        {/*    Charts*/}
                        {/*</Typography>*/}
                        {/*<Item*/}
                        {/*    title="Bar Chart"*/}
                        {/*    to="/bar"*/}
                        {/*    icon={<BarChartOutlinedIcon />}*/}
                        {/*    selected={selected}*/}
                        {/*    setSelected={setSelected}*/}
                        {/*/>*/}
                        {/*<Item*/}
                        {/*    title="Pie Chart"*/}
                        {/*    to="/pie"*/}
                        {/*    icon={<PieChartOutlineOutlinedIcon />}*/}
                        {/*    selected={selected}*/}
                        {/*    setSelected={setSelected}*/}
                        {/*/>*/}
                        {/*<Item*/}
                        {/*    title="Line Chart"*/}
                        {/*    to="/line"*/}
                        {/*    icon={<TimelineOutlinedIcon />}*/}
                        {/*    selected={selected}*/}
                        {/*    setSelected={setSelected}*/}
                        {/*/>*/}
                        {/*<Item*/}
                        {/*    title="Geography Chart"*/}
                        {/*    to="/geography"*/}
                        {/*    icon={<MapOutlinedIcon />}*/}
                        {/*    selected={selected}*/}
                        {/*    setSelected={setSelected}*/}
                        {/*/>*/}
                    </Box>
                </Menu>
            </ProSidebar>
        </Box>
    );
};

export default Sidebar;
