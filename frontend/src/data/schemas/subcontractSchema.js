import * as yup from "yup";

const subcontractSchema = yup.object().shape({
    id: yup.number(),
    subcontract: yup.string().required("required"),
    description: yup.string().required("required"),
    subcontractType: yup.string().required("required"),
    allocation: yup.number(),
    quantity: yup.number(),
    units: yup.string(),
    rate: yup.number(),
    blank: yup.string(),
});

export default subcontractSchema;
