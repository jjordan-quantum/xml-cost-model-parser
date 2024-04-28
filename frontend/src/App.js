import {useState, useContext, useMemo} from "react";
import {ColorModeContext, useMode} from "./theme";
import {CssBaseline, ThemeProvider} from "@mui/material";
import Topbar from "./scenes/global/Topbar";
import {Route, Routes} from "react-router-dom";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import Calendar from "./scenes/calendar";
import SwapParams from "./scenes/settings/swapParams";
import SwapParamsPresets from "./scenes/settings/swapParamsPresets";
import SnipeTriggerConditions from "./scenes/settings/snipeTriggerConditions";
import SnipeTriggerConditionsPresets from "./scenes/settings/snipeTriggerConditionsPresets";
import SellTriggerConditions from "./scenes/settings/sellTriggerConditions";
import SellTriggerConditionsPresets from "./scenes/settings/sellTriggerConditionsPresets";
import MevSettings from "./scenes/settings/mevSettings";
import MevSettingsPresets from "./scenes/settings/mevSettingsPresets";
import GasPriceSettings from "./scenes/settings/gasPriceSettings";
import GasPriceSettingsPresets from "./scenes/settings/gasPriceSettingsPresets";
import Connections from "./scenes/connections/connections";
import ConnectionsPresets from "./scenes/connections/connectionsPresets";
import Account from "./scenes/accounts/account";
import Accounts from "./scenes/accounts/accounts";
import Bottombar from "./scenes/global/Bottombar";
import Environment from "./scenes/environment";
import SnipeSessions from "./scenes/sessions/snipeSessions";
import SnipeSession from "./scenes/sessions/snipeSession";
import Executors from "./scenes/contracts/executors";
import Executor from "./scenes/contracts/executor";
import SecondTriggerWalletSettings from "./scenes/settings/secondTriggerWalletSettings";
import SecondTriggerWalletSettingsPresets from "./scenes/settings/secondTriggerWalletSettingsPresets";
import NetworkConfig from "./scenes/network/networkConfig";
import NetworkConfigPresets from "./scenes/network/networkConfigPresets";
import Statusbar from "./scenes/global/Statusbar";
import Autobot from "./scenes/autobot/autobot";
import Autobots from "./scenes/autobot/autobots";
import BotSwapParams from "./scenes/botSettings/swapParams";
import BotSwapParamsPreset from "./scenes/botSettings/swapParamsPresets";
import BotSnipeTriggerConditions from "./scenes/botSettings/snipeTriggerConditions";
import BotSnipeTriggerConditionsPresets from "./scenes/botSettings/snipeTriggerConditionsPresets";
import BotSellTriggerConditions from "./scenes/botSettings/sellTriggerConditions";
import BotSellTriggerConditionsPresets from "./scenes/botSettings/sellTriggerConditionsPresets";
import BotMevSettings from "./scenes/botSettings/mevSettings";
import BotMevSettingsPresets from "./scenes/botSettings/mevSettingsPresets";
import BotGasPriceSettings from "./scenes/botSettings/gasPriceSettings";
import BotGasPriceSettingsPresets from "./scenes/botSettings/gasPriceSettingsPresets";
import PartTypes from "./scenes/parts/partTypes";
import PartType from "./scenes/parts/partType";
import MaterialTypes from "./scenes/materials/materialTypes";
import MaterialType from "./scenes/materials/materialType";

import AggregateTypes from "./scenes/aggregates/aggregateTypes";
import AggregateType from "./scenes/aggregates/aggregateType";

import TruckTypes from "./scenes/trucks/truckTypes";
import TruckType from "./scenes/trucks/truckType";

import VehicleTypes from "./scenes/vehicles/vehicleTypes";
import VehicleType from "./scenes/vehicles/vehicleType";

import EquipmentTypes from "./scenes/equipment/equipmentTypes";
import EquipmentType from "./scenes/equipment/equipmentType";

import LabourTypes from "./scenes/labour/labourTypes";
import LabourType from "./scenes/labour/labourType";
import LabourClass from "./scenes/labour/labourClass";
import LabourClasses from "./scenes/labour/labourClasses";
import EquipmentClass from "./scenes/equipment/equipmentClass";
import EquipmentClasses from "./scenes/equipment/equipmentClasses";
import VehicleClass from "./scenes/vehicles/vehicleClass";
import VehicleClasses from "./scenes/vehicles/vehicleClasses";
import TruckClass from "./scenes/trucks/truckClass";
import TruckClasses from "./scenes/trucks/truckClasses";
import AggregateClass from "./scenes/aggregates/aggregateClass";
import AggregateClasses from "./scenes/aggregates/aggregateClasses";
import MaterialClass from "./scenes/materials/materialClass";
import MaterialClasses from "./scenes/materials/materialClasses";
import PartClass from "./scenes/parts/partClass";
import PartClasses from "./scenes/parts/partClasses";
import Projects from "./scenes/projects/projects";
import Project from "./scenes/projects/project";
import BidItems from "./scenes/bidItems/bidItems";
import BidItem from "./scenes/bidItems/bidItem";
import IncidentalItems from "./scenes/incidentalItems/incidentalItems";
import IncidentalItem from "./scenes/incidentalItems/incidentalItem";
import Activity from "./scenes/activities/activity";
import Activities from "./scenes/activities/activities";
import Assembly from "./scenes/assemblies/assembly";
import Assemblies from "./scenes/assemblies/assemblies";
import Feature from "./scenes/features/feature";
import Features from "./scenes/features/features";
import Crews from "./scenes/crews/crews";
import Crew from "./scenes/crews/crew";
import Rentals from "./scenes/rentals/rentals";
import Rental from "./scenes/rentals/rental";
import Subcontracts from "./scenes/subcontracts/subcontracts";
import Subcontract from "./scenes/subcontracts/subcontract";
import IncidentalCosts from "./scenes/incidentalCosts/incidentalCosts";
import IncidentalCost from "./scenes/incidentalCosts/incidentalCost";
import Labour from "./scenes/labour/labour";
import Labours from "./scenes/labour/labours";
import Equipments from "./scenes/equipment/equipments";
import Equipment from "./scenes/equipment/equipment";
import Vehicles from "./scenes/vehicles/vehicles";
import Vehicle from "./scenes/vehicles/vehicle";
import Trucks from "./scenes/trucks/trucks";
import Truck from "./scenes/trucks/truck";
import Aggregate from "./scenes/aggregates/aggregate";
import Aggregates from "./scenes/aggregates/aggregates";
import Material from "./scenes/materials/material";
import Materials from "./scenes/materials/materials";
import Part from "./scenes/parts/part";
import Parts from "./scenes/parts/parts";
import CrewTypes from "./scenes/crews/crewTypes";
import CrewType from "./scenes/crews/crewType";
import RentalTypes from "./scenes/rentals/rentalTypes";
import RentalType from "./scenes/rentals/rentalType";
import SubcontractType from "./scenes/subcontracts/subcontractType";
import SubcontractTypes from "./scenes/subcontracts/subcontractTypes";
import IncidentalCostType from "./scenes/incidentalCosts/incidentalCostType";
import IncidentalCostTypes from "./scenes/incidentalCosts/incidentalCostTypes";
import CodeCategory from "./scenes/codes/codeCategory";
import CodeCategories from "./scenes/codes/codeCategories";
import CodeSubCategory from "./scenes/codes/codeSubCategory";
import CodeSubCategories from "./scenes/codes/codeSubCategories";
import CodeNumbers from "./scenes/codes/codeNumbers";
import CodeNumber from "./scenes/codes/codeNumber";


function App() {
    const [theme, colorMode] = useMode();
    const [isSidebar, setIsSidebar] = useState(true);
    const [swapParams, setSwapParams] = useState([]);

    // console.log('Loading App')
    // console.log('Swap params from context:');
    // console.log(swapParams);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <div className="app">
                    <Sidebar isSidebar={isSidebar}/>
                    <main className="content">
                        <Topbar setIsSidebar={setIsSidebar}/>
                        <Routes >
                            {/* MAIN */}
                            {/*<Route path="/" element={<Dashboard/>}/>*/}
                            <Route path="/" element={<Environment/>}/>
                            <Route path="/environment" element={<Environment/>}/>
                            <Route path="/session" element={<SnipeSession/>}/>
                            <Route path="/sessions" element={<SnipeSessions/>}/>
                            <Route path="/autobot" element={<Autobot/>}/>
                            <Route path="/autobots" element={<Autobots/>}/>

                            {/* NETWORK */}

                            <Route path="/network-config" element={<NetworkConfig/>}/>
                            <Route path="/network-config-presets" element={<NetworkConfigPresets/>}/>

                            <Route path="/connections" element={<Connections/>}/>
                            <Route path="/connections-presets" element={<ConnectionsPresets/>}/>

                            <Route path="/account" element={<Account/>}/>
                            <Route path="/accounts" element={<Accounts/>}/>

                            {/* PROJECTS */}

                            <Route path="/project" element={<Project/>}/>
                            <Route path="/projects" element={<Projects/>}/>

                            <Route path="/bid-item" element={<BidItem/>}/>
                            <Route path="/bid-items" element={<BidItems/>}/>

                            <Route path="/incidental-item" element={<IncidentalItem/>}/>
                            <Route path="/incidental-items" element={<IncidentalItems/>}/>

                            {/* BID COMPONENTS */}

                            <Route path="/activity" element={<Activity/>}/>
                            <Route path="/activities" element={<Activities/>}/>

                            <Route path="/assembly" element={<Assembly/>}/>
                            <Route path="/assemblies" element={<Assemblies/>}/>

                            <Route path="/feature" element={<Feature/>}/>
                            <Route path="/features" element={<Features/>}/>

                            {/* CODES */}

                            <Route path="/code-number" element={<CodeNumber/>}/>
                            <Route path="/code-numbers" element={<CodeNumbers/>}/>

                            <Route path="/code-sub-category" element={<CodeSubCategory/>}/>
                            <Route path="/code-sub-categories" element={<CodeSubCategories/>}/>

                            <Route path="/code-category" element={<CodeCategory/>}/>
                            <Route path="/code-categories" element={<CodeCategories/>}/>

                            {/* SPECIAL RESOURCE */}

                            <Route path="/crew" element={<Crew/>}/>
                            <Route path="/crews" element={<Crews/>}/>

                            <Route path="/rental" element={<Rental/>}/>
                            <Route path="/rentals" element={<Rentals/>}/>

                            <Route path="/subcontract" element={<Subcontract/>}/>
                            <Route path="/subcontracts" element={<Subcontracts/>}/>

                            <Route path="/incidental-cost" element={<IncidentalCost/>}/>
                            <Route path="/incidental-costs" element={<IncidentalCosts/>}/>

                            {/* SPECIAL RESOURCE TYPES */}

                            <Route path="/crew-type" element={<CrewType/>}/>
                            <Route path="/crew-types" element={<CrewTypes/>}/>

                            <Route path="/rental-type" element={<RentalType/>}/>
                            <Route path="/rental-types" element={<RentalTypes/>}/>

                            <Route path="/subcontract-type" element={<SubcontractType/>}/>
                            <Route path="/subcontract-types" element={<SubcontractTypes/>}/>

                            <Route path="/incidental-cost-type" element={<IncidentalCostType/>}/>
                            <Route path="/incidental-cost-types" element={<IncidentalCostTypes/>}/>

                            {/* ASSIGNED RESOURCES */}

                            <Route path="/labour" element={<Labour/>}/>
                            <Route path="/labours" element={<Labours/>}/>

                            <Route path="/equipment" element={<Equipment/>}/>
                            <Route path="/equipments" element={<Equipments/>}/>

                            <Route path="/vehicle" element={<Vehicle/>}/>
                            <Route path="/vehicles" element={<Vehicles/>}/>

                            <Route path="/truck" element={<Truck/>}/>
                            <Route path="/trucks" element={<Trucks/>}/>

                            <Route path="/aggregate" element={<Aggregate/>}/>
                            <Route path="/aggregates" element={<Aggregates/>}/>

                            <Route path="/material" element={<Material/>}/>
                            <Route path="/materials" element={<Materials/>}/>

                            <Route path="/part" element={<Part/>}/>
                            <Route path="/parts" element={<Parts/>}/>

                            {/* RESOURCE TYPES */}

                            <Route path="/labour-type" element={<LabourType/>}/>
                            <Route path="/labour-types" element={<LabourTypes/>}/>

                            <Route path="/equipment-type" element={<EquipmentType/>}/>
                            <Route path="/equipment-types" element={<EquipmentTypes/>}/>

                            <Route path="/vehicle-type" element={<VehicleType/>}/>
                            <Route path="/vehicle-types" element={<VehicleTypes/>}/>

                            <Route path="/truck-type" element={<TruckType/>}/>
                            <Route path="/truck-types" element={<TruckTypes/>}/>

                            <Route path="/aggregate-type" element={<AggregateType/>}/>
                            <Route path="/aggregate-types" element={<AggregateTypes/>}/>

                            <Route path="/material-type" element={<MaterialType/>}/>
                            <Route path="/material-types" element={<MaterialTypes/>}/>

                            <Route path="/part-type" element={<PartType/>}/>
                            <Route path="/part-types" element={<PartTypes/>}/>

                            {/* RESOURCE CLASSES */}

                            <Route path="/labour-class" element={<LabourClass/>}/>
                            <Route path="/labour-classes" element={<LabourClasses/>}/>

                            <Route path="/equipment-class" element={<EquipmentClass/>}/>
                            <Route path="/equipment-classes" element={<EquipmentClasses/>}/>

                            <Route path="/vehicle-class" element={<VehicleClass/>}/>
                            <Route path="/vehicle-classes" element={<VehicleClasses/>}/>

                            <Route path="/truck-class" element={<TruckClass/>}/>
                            <Route path="/truck-classes" element={<TruckClasses/>}/>

                            <Route path="/aggregate-class" element={<AggregateClass/>}/>
                            <Route path="/aggregate-classes" element={<AggregateClasses/>}/>

                            <Route path="/material-class" element={<MaterialClass/>}/>
                            <Route path="/material-classes" element={<MaterialClasses/>}/>

                            <Route path="/part-class" element={<PartClass/>}/>
                            <Route path="/part-classes" element={<PartClasses/>}/>
                        </Routes>
                        <Bottombar />
                    </main>
                    {/*<Statusbar />*/}
                </div>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

export default App;
