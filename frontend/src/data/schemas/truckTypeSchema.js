import * as yup from "yup";

const truckTypeSchema = yup.object().shape({
    id: yup.number(),
    truckType: yup.string().required("required"),
    truckClass: yup.string().required("required"),
    description: yup.string().required("required"),
    blank: yup.string(),
});

export default truckTypeSchema;
