import * as yup from "yup";

const environmentSchema = yup.object().shape({
    id: yup.number(),
    snipeMode: yup.string().required("required"),
    chainId: yup.number().required("required"),
    connectionId: yup.number().required("required"),
});

export default environmentSchema;