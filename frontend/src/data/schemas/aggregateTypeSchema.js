import * as yup from "yup";

const aggregateTypeSchema = yup.object().shape({
    id: yup.number(),
    aggregateType: yup.string().required("required"),
    aggregateClass: yup.string().required("required"),
    description: yup.string().required("required"),
    blank: yup.string(),
});

export default aggregateTypeSchema;
