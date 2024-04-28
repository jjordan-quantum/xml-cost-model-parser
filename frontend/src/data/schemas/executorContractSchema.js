import * as yup from "yup";

const executorContractSchema = yup.object().shape({
    id: yup.number(),
    description: yup.string().required("required"),

    chainId: yup.number().required("required"),

    executorContractAddress: yup.string().required("required"),
    deployerAddress: yup.string().required("required"),
    deploymentTransactionHash: yup.string(),
    version: yup.string(),  // current is 3.4.0

    deployerId: yup.number(),  // only used during deployments
    wasDeployed: yup.boolean(),  // set to true when deployed

    authorizeAccountAddress: yup.string(),  // only used when authorizing a single account
    withdrawTokenAddress: yup.string(),  // only used when withdrawing tokens
});

export default executorContractSchema;
