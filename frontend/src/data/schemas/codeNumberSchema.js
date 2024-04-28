import * as yup from "yup";

const codeNumberSchema = yup.object().shape({
    id: yup.number(),
    codeNumber: yup.string().required("required"),
    codeName: yup.string().required("required"),
    codeSubCategoryNumber: yup.string().required("required"),
    codeSubCategory: yup.string().required("required"),
    codeCategoryNumber: yup.string().required("required"),
    codeCategory: yup.string().required("required"),
    description: yup.string().required("required"),
    blank: yup.string(),
});

export default codeNumberSchema;
