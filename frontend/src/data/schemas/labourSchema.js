import * as yup from "yup";

const labourSchema = yup.object().shape({
    id: yup.number(),
    labour: yup.string().required("required"),
    description: yup.string().required("required"),
    labourType: yup.string().required("required"),
    baseHourlyRate: yup.number().required("required"),
    blank: yup.string(),
});

export default labourSchema;
