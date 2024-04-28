import * as yup from "yup";

const incidentalItemSchema = yup.object().shape({
    id: yup.number(),
    projectNumber: yup.string().required("required"),
    incidentalItemNumber: yup.string().required("required"),
    description: yup.string().required("required"),
    bidItemCategory: yup.string(),
    quantity: yup.number(),
    units: yup.string(),
    blank: yup.string(),
});

export default incidentalItemSchema;
