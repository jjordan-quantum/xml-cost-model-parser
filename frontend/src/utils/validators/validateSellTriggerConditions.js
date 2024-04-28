export const validateSellTriggerConditions = (values) => {
    if(!values) {
        return {
            success: false,
            message: 'values undefined',
        }
    }

    const {
        description,

    } = values;

    if(!description) {
        return {
            success: false,
            message: 'no description',
        }
    }

    // TODO

    return {success: true}
}