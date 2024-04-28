import * as yup from "yup";

const incidentalCostSchema = yup.object().shape({
    id: yup.number(),
    incidentalCost: yup.string().required("required"),
    description: yup.string().required("required"),
    incidentalCostType: yup.string().required("required"),
    allocation: yup.number(),
    quantity: yup.number(),
    units: yup.string(),
    rate: yup.number(),
    blank: yup.string(),
});

export default incidentalCostSchema;
