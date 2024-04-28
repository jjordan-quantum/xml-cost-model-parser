export function getRandomInt() {
    return Math.floor((Math.random() * 1000000) + (Math.random() * 100000));
}

export function stringify(data) {
    if(data) {
        return JSON.stringify(data, null, 2);
    } else {
        return '';
    }
}

export function isDescriptionUnique(description, items) {
    for(const item of items) {
        if(item && (item.description === description)) { return false; }
    }

    return true;
}
