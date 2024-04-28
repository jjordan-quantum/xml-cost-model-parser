import * as yup from "yup";

const materialSchema = yup.object().shape({
    id: yup.number(),
    material: yup.string().required("required"),
    description: yup.string().required("required"),
    materialType: yup.string().required("required"),
    quantity: yup.number().required("required"),
    units: yup.string().required("required"),
    rate: yup.number().required("required"),
    blank: yup.string(),
});

export default materialSchema;
