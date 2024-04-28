import * as yup from "yup";

const equipmentClassSchema = yup.object().shape({
    id: yup.number(),
    equipmentClass: yup.string().required("required"),
    description: yup.string().required("required"),
    blank: yup.string(),
});

export default equipmentClassSchema;
