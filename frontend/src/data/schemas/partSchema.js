import * as yup from "yup";

const partSchema = yup.object().shape({
    id: yup.number(),
    part: yup.string().required("required"),
    description: yup.string().required("required"),
    partType: yup.string().required("required"),
    quantity: yup.number().required("required"),
    units: yup.string().required("required"),
    rate: yup.number().required("required"),
    blank: yup.string(),
});

export default partSchema;
