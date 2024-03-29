const {XMLParser} = require('fast-xml-parser');
const {readFileSync} = require("fs");
const util = require("util");
const data = readFileSync('./data/test_project.drawio', 'utf8');

const projectTree = {};
const projects = [];
const subProjects = [];
const bidItemGroups = [];
const bidItems = [];
const activities = [];
const siteFeatures = [];
const assemblies = [];
const crews = [];
const trucks = [];
const incidentals = [];
const subcontractors = [];


const labour = [];
const equipment = [];
const vehicle = [];

const assignedCrew = [];
const assignedLabour = [];
const assignedEquipment = [];
const assignedVehicle = [];

let foundProject = false;

const nodeTypes = {
    project: projects,
    subProject: subProjects,
    bidItemGroup: bidItemGroups,
    bidItem: bidItems,
    activity: activities,
    siteFeature: siteFeatures,
    assembly: assemblies,
    crew: crews,
    trucking: trucks,
    subcontractor: subcontractors,
    incidentalCost: incidentals,

    labour,
    equipment,
    vehicle,

    assignedCrew,
    assignedLabour,
    assignedEquipment,
    assignedVehicle,
}

const leafTypes = [
    'subcontractor',
    'incidentalCost',
    'trucking',
    'crew',
    'aggregate',
    'material',
];

const options = {
    ignoreAttributes: false,
};

const findDefinition = (type, description) => {
    for(const obj of nodeTypes[type]) {
        if(obj.description === description) {
            return obj;
        }
    }

    return undefined;
}

// cost record = { source, type, totalCost, hrs } -> source in [activity, feature, etc], type in [sub, lab, etc], hrs only for lab/equip
const getCostRecords = (parent, duration, quantity, units) => {
    const costRecords = [];

    const {
        nodeType,
        description,
    } = parent;

    const children = parent.children || [];

    // TODO - site feature
    // TODO - assembly
    // TODO - aggregate
    // TODO - material

    // trucking
    // ==========================================
    if(parent.nodeType === 'trucking') {
        const {
            hourlyRate,
            roundTripDurationHours,
            totalRoundTrips,
            totalTrucks,
            truckType,
        } = parent;

        const totalHours = (parseFloat(totalRoundTrips) || 0) * (parseFloat(roundTripDurationHours) || 0);
        const totalCost = Number((totalHours * (parseFloat(hourlyRate) || 0).toFixed(2)));

        console.log(`HAUL: ${description}`);
        console.log(`  - quantity: ${quantity} ${units}`);
        console.log(`  - truck type: ${truckType}`);
        console.log(`  - total trucks required: ${totalTrucks}`);
        console.log(`  - total trips: ${totalRoundTrips}`);
        console.log(`  - round trip duration: ${roundTripDurationHours} HRS`);
        console.log(`  - total hours: ${totalHours} HRS`);
        console.log(`  - total cost: $${totalCost}`);

        return [{
            origin: description,
            source: description,
            type: 'trucking',
            totalCost,
            hours: totalHours,

            hourlyRate,
            roundTripDurationHours,
            totalRoundTrips,
            totalTrucks,
            truckType,
        }];
    }

    // subcontractor
    // ==========================================
    if(parent.nodeType === 'subcontractor') {
        // TODO
        return[];
    }

    // incidental
    // ==========================================
    if(parent.nodeType === 'incidentalCost') {
        const {
            incidentalCostType,
            quantity,
            subTotal,
            tax,  // TODO
            totalCost,
            unitRate,
            units,
            vendorType,
        } = parent;

        const _totalCost = Number(((parseFloat(quantity) || 0) * (parseFloat(unitRate) || 0).toFixed(2)));

        console.log(`INCIDENTAL COST: ${description}`);
        console.log(`  - type: ${incidentalCostType}`);
        console.log(`  - quantity: ${quantity} ${units}`);
        console.log(`  - unitRate: $${unitRate} per ${units}`);
        console.log(`  - total cost: $${_totalCost}`);

        return [{
            origin: description,
            source: description,
            type: 'incidentalCost',
            totalCost: _totalCost,

            incidentalCostType,
            quantity,
            subTotal: _totalCost,
            tax,
            unitRate,
            units,
            vendorType,
        }];
    }

    // activity
    // ==========================================
    if(parent.nodeType === 'activity') {
        const {
            productionDurationHours,
            productionQuantity,
            productionQuantityUnits,
            productionRate,
            productionRateUnits,
            productionDurationPerUnit,
        } = parent;

        let shouldMultiply = !!(productionDurationPerUnit);

        const rate = shouldMultiply
            ? (parseFloat(productionDurationPerUnit) || 0)
            : (parseFloat(productionRate) || 1);

        const totalHours = shouldMultiply ? (parseFloat(productionQuantity) || 0) * rate
            : (parseFloat(productionQuantity) || 0) / rate;

        console.log(`ACTIVITY: ${description}`);
        console.log(`  - quantity: ${productionQuantity} ${productionQuantityUnits}`);
        console.log(`  - production rate: ${productionRate} ${productionRateUnits}`);
        console.log(`  - total duration: ${totalHours} HRS`);

        for(const child of children) {
            const results = getCostRecords(child, totalHours, productionQuantity, productionQuantityUnits);

            if(results) {
                for(const result of results) {
                    costRecords.push({
                        ...result,
                        source: description,
                    });
                }
            }
        }

        return costRecords;
    }

    // crew
    // ==========================================
    if(parent.nodeType === 'assignedCrew') {
        if(!duration) {
            console.error(`Duration hours undefined - cannot calculate crew costs for ${description}`);
            return undefined;
        }

        console.log(`  - ${description} @ ${duration} HRS`);
        let total = 0;

        for(const child of parent.children) {
            const results = getCostRecords(child, duration, quantity, units);

            if(results) {
                for(const record of results) {
                    total += (record?.totalCost) || 0;
                    costRecords.push(record);
                }
            }
        }

        console.log(`    - CREW TOTAL: $${total}`);

        return costRecords;
    }

    // labour
    // ==========================================
    if(parent.nodeType === 'labour') {
        if(!duration) {
            console.error(`Duration hours undefined - cannot calculate labour costs for ${description}`);
            return undefined;
        }

        const {
            baseHourlyRate,
        } = parent;

        const hourlyRate = parseFloat(baseHourlyRate) || 0.0;
        const totalCost = Number((duration * hourlyRate).toFixed(2));
        console.log(`    - ${description} @ $${hourlyRate}/HR - TOTAL: $${totalCost}`);

        return [{
            origin: description,
            source: description,
            type: 'labour',
            totalCost,
            hours: duration,

            hourlyRate,
        }];
    }

    // equipment
    // ==========================================
    if(parent.nodeType === 'equipment') {
        if(!duration) {
            console.error(`Duration hours undefined - cannot calculate equipment costs for ${description}`);
            return undefined;
        }

        const {
            baseHourlyRate,
        } = parent;

        const hourlyRate = parseFloat(baseHourlyRate) || 0.0;
        const totalCost = Number((duration * hourlyRate).toFixed(2));
        console.log(`    - ${description} @ $${hourlyRate}/HR - TOTAL: $${totalCost}`);

        return [{
            origin: description,
            source: description,
            type: 'equipment',
            totalCost,
            hours: duration,

            hourlyRate,
        }];
    }

    // vehicle
    // ==========================================
    if(parent.nodeType === 'vehicle') {
        if(!duration) {
            console.error(`Duration hours undefined - cannot calculate vehicle costs for ${description}`);
            return undefined;
        }

        const {
            baseHourlyRate,
        } = parent;

        const hourlyRate = parseFloat(baseHourlyRate) || 0.0;
        const totalCost = Number((duration * hourlyRate).toFixed(2));
        console.log(`    - ${description} @ $${hourlyRate}/HR - TOTAL: $${totalCost}`);

        return [{
            origin: description,
            source: description,
            type: 'vehicle',
            totalCost,
            hours: duration,

            hourlyRate,
        }];
    }



    if(parent.hasOwnProperty('children') && !!parent.children) {
        for(const child of parent.children) {
            const results = getCostRecords(child, duration, quantity, units);

            if(results) {
                for(const record of results) {
                    costRecords.push(record);
                }
            }
        }
    }

   return costRecords;
}

const getCostSummaryForBidItem = (bidItem) => {
    const {
        itemNumber,
        description,
        children,
    } = bidItem;

    console.log(`Getting cost summary for ${itemNumber} - ${description}`);
    console.log('--------------------------------------------');
    const costRecords = getCostRecords(bidItem);
    console.log();
}

try {
    const parser = new XMLParser(options);
    const output = parser.parse(data);
    //console.log(util.inspect(output, false, null, true));
    const objectsArray = [];
    const objects = {};
    const edges = [];

    for(const obj of output.mxfile.diagram.mxGraphModel.root.object) {
        const mapped = {};

        for(const key of Object.keys(obj)) {
            if(key.startsWith('@_')) {
                mapped[key.slice(2)] = obj[key];
            } else {
                mapped[key] = obj[key]
            }
        }

        const {
            label,
            id,
            nodeType,
        } = mapped;

        objectsArray.push(mapped);

        if(!id) {
            console.log('********* OBJECT HAS NO ID! *********');
        } else {
            objects[id] = mapped;
        }

        mapped.aggregatedCosts = {
            labour: 0,
            equipment: 0,
            vehicles: 0,
            rentals: 0,
            aggregates: 0,
            materials: 0,
            trucking: 0,
            subcontracts: 0,
        };

        mapped.children = [];
        delete mapped.mxCell;

        if(!nodeType) {
            console.log('********* OBJECT HAS NO NODE TYPE! *********');
        } else if(!nodeTypes.hasOwnProperty(nodeType)) {
            console.log(`Node type '${nodeType}' not found!`);
        } else if(!label.toLowerCase().includes('template')) {
            nodeTypes[nodeType].push(mapped);
        }
    }

    for(const geometry of output.mxfile.diagram.mxGraphModel.root.mxCell) {
        const mapped = {}

        for(const key of Object.keys(geometry)) {
            if(key.startsWith('@_')) {
                mapped[key.slice(2)] = geometry[key];
            } else {
                mapped[key] = geometry[key]
            }

            if(mapped.hasOwnProperty('source') && mapped.hasOwnProperty('target')) {
                const {
                    source,
                    target
                } = mapped;

                const sourceObject = objects[source];
                const targetObject = objects[target];
                console.log('FOUND EDGE');
                console.log(`SOURCE: ${sourceObject ? sourceObject.label : ''}`);
                console.log(`TARGET: ${targetObject ? targetObject.label : ''}`);
                console.log();

                sourceObject.children.push(targetObject);

                if(sourceObject.nodeType === 'project') {
                    if(foundProject) {
                        console.error(`Found another connected project!!!! ${sourceObject.label} - BUG?`);
                    } else {
                        console.log(`FOUND PROJECT: ${sourceObject.label}`);
                        console.log();
                        foundProject = true;
                        projectTree.project = sourceObject;
                    }
                }
            }
        }
    }

    // assign crews

    console.log(`Resolving ${assignedCrew.length} assigned crews`);

    // iterate over assigned crews
    for(const _assignedCrew of assignedCrew) {
        const {
            description,
        } = _assignedCrew;

        console.log(`Resolving ASSIGNED CREW: ${description}`);

        // find crew for assigned crew -> add info fields
        const crew = findDefinition('crew', description);

        if(!crew) {
            console.log(`Crew not found for ${description}!`);
            continue;
        }

        console.log(`Found crew for ${description} with ${crew.children.length} children!`);
        //_assignedCrew.children = [..._assignedCrew.children, ...crew.children];

        for(const child of crew.children) {
            const {
                nodeType,
                description,
            } = child;

            let useType = 'labour';

            if(nodeType.includes('Vehicle')) {
                useType = 'vehicle';
            } else if(nodeType.includes('Equipment')) {
                useType = 'equipment';
            }

            const definition = findDefinition(useType, description);

            if(!definition) {
                console.log(`Definition not found for ${nodeType} child: ${description}!`);
                continue;
            }

            console.log(definition);
            _assignedCrew.children.push(definition);
        }
    }


    // iterate over labour, equipment, vehicles
    // find resources assigned to crew
    // resolve resources definitions for assigned resources -> add to crew child

    //console.log(objects);
    console.log(util.inspect(projectTree, false, null, true));

    console.log(`Project: ${projectTree.project.label}`);
    console.log('============================================');
    console.log();

    for(const subProject of subProjects) {
        console.log(`Sub Project: ${subProject.label}`);
    }

    console.log();
    console.log('Bid Items + Activities');
    console.log('--------------------------------------------');
    console.log();

    for(const group of bidItemGroups) {
        console.log(`Bid Item Group: ${group.label}`);

        for(const child of group.children) {
            console.log(`${child.itemNumber} - ${child.description} - ${child.estQuantity} ${child.units}`);

            for(const _child of child.children) {
                console.log(`   - ${_child.nodeType} - ${_child.description} `);

                for(const __child of _child.children) {
                    console.log(`       - ${__child.nodeType} - ${__child.description} `);

                    for(const ___child of __child.children) {
                        console.log(`           - ${___child.nodeType} - ${___child.description} `);
                    }
                }
            }
        }

        console.log();
    }

    console.log('============================================');
    console.log('Bid Items + Costs');
    console.log('============================================');
    console.log();

    for(const group of bidItemGroups) {
        for(const bidItem of group.children) {
            getCostSummaryForBidItem(bidItem);
        }
    }

    // update costs -> traverse tree

    //console.log(util.inspect(projectTree, false, null, true));
} catch(e) {
    console.log(e);
}
