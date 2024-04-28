import * as yup from "yup";

const vehicleSchema = yup.object().shape({
    id: yup.number(),
    vehicle: yup.string().required("required"),
    description: yup.string().required("required"),
    vehicleType: yup.string().required("required"),
    baseHourlyRate: yup.number().required("required"),
    blank: yup.string(),
});

export default vehicleSchema;
