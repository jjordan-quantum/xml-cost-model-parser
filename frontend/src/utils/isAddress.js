import {isHex} from "./isHex";

export const isAddress = (h) => {
    return (h.length === 42) && isHex(h);
}
