import * as yup from "yup";

const rentalSchema = yup.object().shape({
    id: yup.number(),
    rental: yup.string().required("required"),
    description: yup.string().required("required"),
    rentalType: yup.string().required("required"),
    allocation: yup.number(),
    quantity: yup.number(),
    units: yup.string(),
    rate: yup.number(),
    blank: yup.string(),
});

export default rentalSchema;
