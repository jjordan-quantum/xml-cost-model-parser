import {decrypt} from "./encrypt";

export default function getStorage (key) {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(decrypt(item)) : undefined;
    } catch(e) {
        console.log(`Error getting storage for ${key}`);
        console.log(e);
    }
}
