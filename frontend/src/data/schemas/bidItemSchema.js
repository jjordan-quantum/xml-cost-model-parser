import * as yup from "yup";

const bidItemSchema = yup.object().shape({
    id: yup.number(),
    projectNumber: yup.string().required("required"),
    bidItemNumber: yup.string().required("required"),
    description: yup.string().required("required"),
    bidItemCode: yup.string(),
    quantity: yup.number(),
    units: yup.string(),
    blank: yup.string(),
});

export default bidItemSchema;
