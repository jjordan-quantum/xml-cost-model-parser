import * as yup from "yup";

const aggregateSchema = yup.object().shape({
    id: yup.number(),
    aggregate: yup.string().required("required"),
    description: yup.string().required("required"),
    aggregateType: yup.string().required("required"),
    quantity: yup.number().required("required"),
    units: yup.string().required("required"),
    conversionFactor: yup.number().required("required"),
    conversionFactorUnits: yup.string().required("required"),
    finalUnits: yup.string().required("required"),
    rate: yup.number().required("required"),
    blank: yup.string(),
});

export default aggregateSchema;
