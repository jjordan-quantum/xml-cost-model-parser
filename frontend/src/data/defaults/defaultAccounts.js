const defaultAccounts = [{
    id: 0,
    description: 'DEFAULT ACCT - DO NOT USE',
    privateKey: '0000000000000000000000000000000000000000000000000000000000000000',
    address: '0x0000000000000000000000000000000000000000',
}];

export default defaultAccounts;

export const defaultAccountDescriptions = defaultAccounts.map(a => a.description);

export const ensureDefaultAccounts = (accounts, setAccounts) => {
    const descriptions = (accounts || []).map(o => o.description);
    const ids = (accounts || []).map(o => o.id);
    let maxId = -1;
    let rendered = false;

    for(const id of ids) {
        if(typeof(id) !== 'undefined') {
            if(id > maxId) { maxId = id; }
        }
    }

    for(const item of defaultAccounts) {
        const {description} = item;

        if(!descriptions.includes(description)) {
            rendered = true;
            maxId++;
            const useId = maxId;

            accounts.push({
                ...item,
                id: useId,
            });
        }
    }

    if(rendered) {
        setAccounts(accounts);
    }
}
