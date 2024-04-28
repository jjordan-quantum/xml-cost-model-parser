import * as yup from "yup";

const vehicleTypeSchema = yup.object().shape({
    id: yup.number(),
    vehicleType: yup.string().required("required"),
    vehicleClass: yup.string().required("required"),
    description: yup.string().required("required"),
    blank: yup.string(),
});

export default vehicleTypeSchema;
