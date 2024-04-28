import * as yup from "yup";

const assemblySchema = yup.object().shape({
    id: yup.number(),
    assemblyType: yup.string().required("required"),
    description: yup.string().required("required"),
    assemblyCode: yup.string(),

    codeNumber: yup.string().required("required"),
    codeName: yup.string().required("required"),
    codeSubCategoryNumber: yup.string().required("required"),
    codeSubCategory: yup.string().required("required"),
    codeCategoryNumber: yup.string().required("required"),
    codeCategory: yup.string().required("required"),

    productionQuantity: yup.number(),
    productionQuantityUnits: yup.string(),
    productionRate: yup.number(),
    productionRateUnits: yup.string(),
    productionDurationPerUnit: yup.number(),
    blank: yup.string(),
});

export default assemblySchema;
