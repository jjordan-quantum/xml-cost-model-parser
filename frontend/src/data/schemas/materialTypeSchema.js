import * as yup from "yup";

const materialTypeSchema = yup.object().shape({
    id: yup.number(),
    materialType: yup.string().required("required"),
    materialClass: yup.string().required("required"),
    description: yup.string().required("required"),
    blank: yup.string(),
});

export default materialTypeSchema;
