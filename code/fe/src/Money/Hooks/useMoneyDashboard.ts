import { useCallback, useEffect, useState } from 'react';
import { moneyRepository } from '../../Common/Repositories';
import { MetricState, emptyMetric } from '../../Core/dataState';
import { moneyDashboard } from '../Models/dashboard';
import { loadMoneyRecords, loadTimeEntries } from '../Models/storage';
import { MoneyRecordLike, MoneySummary } from '../Models/summary';

export interface MoneyDashboard {
  readonly summary: MetricState<MoneySummary>;
  readonly records: readonly MoneyRecordLike[];
  /** Trong lúc nạp, màn hình không vẽ gì — chưa biết có dữ liệu hay không. */
  readonly loading: boolean;
  readonly reload: () => void;
}

export function useMoneyDashboard(): MoneyDashboard {
  const [records, setRecords] = useState<readonly MoneyRecordLike[]>([]);
  const [summary, setSummary] = useState<MetricState<MoneySummary>>(
    emptyMetric<MoneySummary>('no_data'),
  );
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    let alive = true;
    Promise.all([loadMoneyRecords(), loadTimeEntries()]).then(
      ([moneyRecords, timeEntries]) => {
        if (!alive) return;
        setRecords(moneyRecords);
        setSummary(moneyDashboard(moneyRecords, timeEntries));
        setLoading(false);
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const stop = reload();
    const onChanged = () => {
      reload();
    };
    moneyRepository.registerDataChanged(onChanged);
    return () => {
      stop();
      moneyRepository.unRegisterDataChanged(onChanged);
    };
  }, [reload]);

  return { summary, records, loading, reload };
}
