import * as yup from "yup";

const partClassSchema = yup.object().shape({
    id: yup.number(),
    partClass: yup.string().required("required"),
    description: yup.string().required("required"),
    blank: yup.string(),
});

export default partClassSchema;
