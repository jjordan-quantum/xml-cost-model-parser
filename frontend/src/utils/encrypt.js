const CryptoJS = require("crypto-js");
const STORAGE_KEY = process.env.REACT_APP_STORAGE_KEY;

export function encrypt(message) {
    return CryptoJS.AES.encrypt(message, STORAGE_KEY).toString();
}

export function decrypt(ciphertext) {
    const bytes  = CryptoJS.AES.decrypt(ciphertext, STORAGE_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}
