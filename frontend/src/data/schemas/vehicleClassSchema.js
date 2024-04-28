import * as yup from "yup";

const vehicleClassSchema = yup.object().shape({
    id: yup.number(),
    vehicleClass: yup.string().required("required"),
    description: yup.string().required("required"),
    blank: yup.string(),
});

export default vehicleClassSchema;
