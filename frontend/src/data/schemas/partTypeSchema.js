import * as yup from "yup";

const partTypeSchema = yup.object().shape({
    id: yup.number(),
    partType: yup.string().required("required"),
    partClass: yup.string().required("required"),
    description: yup.string().required("required"),
    blank: yup.string(),
});

export default partTypeSchema;
