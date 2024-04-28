import * as yup from "yup";

const aggregateClassSchema = yup.object().shape({
    id: yup.number(),
    aggregateClass: yup.string().required("required"),
    description: yup.string().required("required"),
    blank: yup.string(),
});

export default aggregateClassSchema;
