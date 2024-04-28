import * as yup from "yup";

const truckClassSchema = yup.object().shape({
    id: yup.number(),
    truckClass: yup.string().required("required"),
    description: yup.string().required("required"),
    blank: yup.string(),
});

export default truckClassSchema;
