import * as yup from "yup";

const projectSchema = yup.object().shape({
    id: yup.number(),
    projectNumber: yup.string().required("required"),
    projectName: yup.string().required("required"),
    projectLocation: yup.string().required("required"),
    closingDate: yup.string(),
    closingTime: yup.string(),
    owner: yup.string(),
    blank: yup.string(),
});

export default projectSchema;
