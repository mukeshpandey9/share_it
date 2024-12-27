import {MMKV} from 'react-native-mmkv';

export const Storage = new MMKV({
  id: 'storage-id',
  encryptionKey: 'storage-secret-key',
});

export const mmkvStorage = {
  setItem: (key: string, value: string) => {
    Storage.set(key, value);
  },
  getItem: (key: string) => {
    const value = Storage.getString(key);
    return value ?? null;
  },
  removeItem: (key: string) => {
    Storage.delete(key);
  },
};
