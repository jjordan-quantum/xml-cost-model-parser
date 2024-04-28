import * as yup from "yup";

const rentalTypeSchema = yup.object().shape({
    id: yup.number(),
    rentalType: yup.string().required("required"),
    description: yup.string().required("required"),
    blank: yup.string(),
});

export default rentalTypeSchema;
