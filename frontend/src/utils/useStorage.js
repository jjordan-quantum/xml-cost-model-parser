import useSessionStorage from "./useSessionStorage";

export const useStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useSessionStorage(key, initialValue);
    let _storedValue = storedValue;

    const _getStoredValue = () => { return _storedValue; }

    const _setStoredValue = (value) => {
        _storedValue = value;
        setStoredValue(value);
    }

    return [_getStoredValue, _setStoredValue];
}
