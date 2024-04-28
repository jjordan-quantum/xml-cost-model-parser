import * as yup from "yup";

const equipmentTypeSchema = yup.object().shape({
    id: yup.number(),
    equipmentType: yup.string().required("required"),
    equipmentClass: yup.string().required("required"),
    description: yup.string().required("required"),
    blank: yup.string(),
});

export default equipmentTypeSchema;
