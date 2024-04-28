import * as yup from "yup";

const accountSchema = yup.object().shape({
    id: yup.number(),
    description: yup.string().required("required"),
    privateKey: yup.string().required("required"),
    address: yup.string(),  // auto-generated
    balance: yup.string(),
    nonce: yup.number(),
    sent: yup.number(),
    pending: yup.number(),
    confirmed: yup.number(),
    tokenBalance: yup.string(),
});

export default accountSchema;
