import {encrypt} from "./encrypt";

export default function setStorage(key, value) {
    window.localStorage.setItem(key, encrypt(JSON.stringify(value)));
}
