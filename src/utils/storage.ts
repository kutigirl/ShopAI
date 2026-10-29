// Storage adapter thay thế cho expo-secure-store trong môi trường React Native CLI
const memoryStorage = new Map<string, string>();

export const getItemAsync = async (key: string): Promise<string | null> => {
  return memoryStorage.get(key) ?? null;
};

export const setItemAsync = async (key: string, value: string): Promise<void> => {
  memoryStorage.set(key, value);
};

export const deleteItemAsync = async (key: string): Promise<void> => {
  memoryStorage.delete(key);
};

export default {
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
};
