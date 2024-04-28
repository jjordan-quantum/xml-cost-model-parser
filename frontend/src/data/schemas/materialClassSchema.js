import * as yup from "yup";

const materialClassSchema = yup.object().shape({
    id: yup.number(),
    materialClass: yup.string().required("required"),
    description: yup.string().required("required"),
    blank: yup.string(),
});

export default materialClassSchema;
