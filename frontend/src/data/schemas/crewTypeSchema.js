import * as yup from "yup";

const crewTypeSchema = yup.object().shape({
    id: yup.number(),
    crewType: yup.string().required("required"),
    description: yup.string().required("required"),
    blank: yup.string(),
});

export default crewTypeSchema;
