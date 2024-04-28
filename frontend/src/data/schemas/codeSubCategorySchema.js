import * as yup from "yup";

const codeSubCategorySchema = yup.object().shape({
    id: yup.number(),
    codeSubCategoryNumber: yup.string().required("required"),
    codeSubCategory: yup.string().required("required"),
    codeCategoryNumber: yup.string().required("required"),
    codeCategory: yup.string().required("required"),
    description: yup.string().required("required"),
    blank: yup.string(),
});

export default codeSubCategorySchema;
