import * as yup from "yup";

const crewSchema = yup.object().shape({
    id: yup.number(),
    crew: yup.string().required("required"),
    description: yup.string().required("required"),
    crewType: yup.string().required("required"),
    labour: yup.array(),
    equipment: yup.array(),
    vehicles: yup.array(),
    blank: yup.string(),
});

export default crewSchema;
