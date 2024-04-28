import * as yup from "yup";

const labourClassSchema = yup.object().shape({
    id: yup.number(),
    labourClass: yup.string().required("required"),
    description: yup.string().required("required"),
    blank: yup.string(),
});

export default labourClassSchema;
