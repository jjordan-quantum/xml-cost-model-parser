import * as yup from "yup";

const labourTypeSchema = yup.object().shape({
    id: yup.number(),
    labourType: yup.string().required("required"),
    labourClass: yup.string().required("required"),
    description: yup.string().required("required"),
    blank: yup.string(),
});

export default labourTypeSchema;
