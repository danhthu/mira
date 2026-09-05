import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dispatch, MutableRefObject, SetStateAction, useEffect, useRef, useState } from 'react';
import { StartProfiling } from '../../../hook/useScreenLoadTime';
import { base } from '../Entities';
import { Repository } from '../Repositories';
import { uuid } from '../Utils/common';

export function useDectectDataChanged<T extends base>(repo: Repository<T>, deps?: (arg: T) => boolean): string {
  const [data, setData] = useState(uuid());
  const _lastVal = null;
  useEffect(() => {
    const f = () => setData(uuid());
    repo.registerDataChanged(f);
    return () => repo.unRegisterDataChanged(f);
  }, []);
  return data;
}

export function useAsyncAction<T>(action: () => Promise<T>, deps: Array<any> | undefined, def?: T, profile?: string): T {
  const [data, setData] = useState(def || null as T);
  useEffect(() => {
    const f = (async () => {
      const start = StartProfiling(profile);
      const _data = (await action());
      start.end();
      if (_data) {
        setData(_data);
      }
    }
    );
    setTimeout(f, 200);
  }, deps);
  return data;
}


export function useStateData<T>(value?: T): [T, Dispatch<SetStateAction<T>>, ref: MutableRefObject<T>] {
  const [data, setData] = useState(value);
  const dataRef = useRef(value);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);
  return [data, setData, dataRef];
}

export const useHandleAsync = () => {
  return;
};
interface Dictionary {

  [key: string]: any

}
interface Settings extends Dictionary {
  dateFormat?: string
}

// Phần tử thứ ba `loaded` cho biết đã đọc xong storage chưa. Cần vì mỗi lần gọi
// hook là một state riêng khởi tạo bằng mặc định — ai đọc settings ngay lần render
// đầu (vd. initialRouteName của navigator, chỉ có tác dụng lúc mount) sẽ thấy
// giá trị chưa nạp. Chỗ gọi cũ chỉ lấy hai phần tử đầu nên không ảnh hưởng.
export const useSettings = (): [Settings, (updated: Settings) => void, boolean] => {
  const [data, setData] = useState({ dateFormat: 'DD-MMM-YYYY' } as Settings);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    (async () => {
      const tmp = await AsyncStorage.getItem('settings');
      if (tmp) {
        setData({ ...{ dateFormat: 'DD-MM-YYYY' }, ...JSON.parse(tmp, isoStringToDate) } as Settings);
      } else {
        setData({ dateFormat: 'DD-MM-YYYY' } as Settings);
      }
      setLoaded(true);
    }
    )();
  }, []);

  return [data, (updated: Settings) => {
    AsyncStorage.setItem('settings', JSON.stringify({ ...data, ...updated }));
    setData(prev => {
      return { ...prev, ...updated, u: new Date().getTime() };
    });
  }, loaded];
};
function isoStringToDate(key: string, value: any) {
  const isoFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
  if (typeof value === 'string' && isoFormat.test(value)) {
    return new Date(value);
  }
  return value;
}