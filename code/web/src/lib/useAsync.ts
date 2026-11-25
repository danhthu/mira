import { useCallback, useEffect, useState } from 'react';

export interface AsyncState<T> {
  readonly data: T | null;
  readonly error: string | null;
  readonly loading: boolean;
  readonly reload: () => void;
}

/**
 * Nạp dữ liệu một lần và nạp lại khi gọi `reload`.
 *
 * Không có tầng cache nào bên trên. Từ 25/11/2026 mọi lệnh đọc đều đi qua mạng, nên đổi
 * màn qua lại là gọi lại API. Chấp nhận được khi mỗi máy chủ phục vụ một người; lúc nào
 * thấy màn nháy khi chuyển tab thì đây là chỗ phải sửa.
 */
export function useAsync<T>(load: () => Promise<T>, deps: readonly unknown[]): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  // `load` được tạo lại mỗi lần render nên deps do nơi gọi khai báo, không phải `load`.
  const run = useCallback(load, deps);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    run()
      .then((value) => {
        if (alive) {
          setData(value);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (alive) setError(cause instanceof Error ? cause.message : 'Có lỗi xảy ra');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [run, tick]);

  return { data, error, loading, reload: () => setTick((n) => n + 1) };
}
