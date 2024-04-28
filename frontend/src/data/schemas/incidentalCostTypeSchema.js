import * as yup from "yup";

const incidentalCostTypeSchema = yup.object().shape({
    id: yup.number(),
    incidentalCostType: yup.string().required("required"),
    description: yup.string().required("required"),
    blank: yup.string(),
});

export default incidentalCostTypeSchema;
