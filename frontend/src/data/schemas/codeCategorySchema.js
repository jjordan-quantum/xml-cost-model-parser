import * as yup from "yup";

const codeCategorySchema = yup.object().shape({
    id: yup.number(),
    codeCategoryNumber: yup.string().required("required"),
    codeCategory: yup.string().required("required"),
    description: yup.string().required("required"),
    blank: yup.string(),
});

export default codeCategorySchema;
