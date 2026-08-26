import AsyncStorage from "@react-native-async-storage/async-storage";
import { DbProvider } from "./DbProvider";

export class AsyncStorageProvider implements DbProvider {
    getItem(key: string): Promise<string> {
        return AsyncStorage.getItem(key);
    }
    setItem(key: string, value: string): Promise<void> {
        return AsyncStorage.setItem(key, value);
    }
}