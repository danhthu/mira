export interface DbProvider {
    getItem(key: string): Promise<string>;
    setItem(key: string, value: string): Promise<void>;
}
