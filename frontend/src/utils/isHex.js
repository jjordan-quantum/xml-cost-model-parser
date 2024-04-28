const prepend0x = (s) => {
    return s.startsWith('0x') ? s : '0x' + s;
}

const strip0x = (s) => {
    return s.startsWith('0x') ? s.slice(2) : s;
}

const chars = '0123456789abcdefgh';

export const isHex = (h) => {
    const rawHex = strip0x(h).toLowerCase();

    for(let i = 0; i < rawHex.length; i++) {
        if(!chars.includes(rawHex[i])) {
            return false;
        }
    }

    return true;
}
