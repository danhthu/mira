import {
    DbProvider
} from '../../src/Common/Repositories/Repo';
export class JsProvider implements DbProvider {
    private data: { [key: string]: any } = {};
    getItem(key: string): Promise<string> {
        return this.data[key];
    }
    setItem(key: string, value: string): Promise<void> {
        this.data[key] = value;
        return;
    }
}