import * as yup from "yup";

const subcontractTypeSchema = yup.object().shape({
    id: yup.number(),
    subcontractType: yup.string().required("required"),
    description: yup.string().required("required"),
    blank: yup.string(),
});

export default subcontractTypeSchema;
