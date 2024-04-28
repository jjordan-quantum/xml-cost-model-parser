import * as yup from "yup";

const truckSchema = yup.object().shape({
    id: yup.number(),
    truck: yup.string().required("required"),
    description: yup.string().required("required"),
    truckType: yup.string().required("required"),
    baseHourlyRate: yup.number().required("required"),
    blank: yup.string(),
});

export default truckSchema;
