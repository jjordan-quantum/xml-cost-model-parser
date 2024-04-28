import * as yup from "yup";

const equipmentSchema = yup.object().shape({
    id: yup.number(),
    equipment: yup.string().required("required"),
    description: yup.string().required("required"),
    equipmentType: yup.string().required("required"),
    baseHourlyRate: yup.number().required("required"),
    blank: yup.string(),
});

export default equipmentSchema;
