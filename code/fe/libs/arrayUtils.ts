/*export const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
    list.reduce((previous, currentItem) => {
        const group = getKey(currentItem);
        if (!previous[group]) previous[group] = [];
        previous[group].push(currentItem);
        return previous;
    }, {} as Record<K, T[]>);
*/

export function groupBy<T>(
  array: T[],
  key: (item: T) => string | number,
): { key: string | number; data: T[] }[] {
  const grouped = array.reduce((result, currentValue) => {
    const groupKey = key(currentValue)
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(currentValue)
    return result
  }, {} as Record<string | number, T[]>)

  // Convert the result into an array of { key, data }
  return Object.keys(grouped).map((groupKey) => ({
    key: groupKey,
    data: grouped[groupKey as keyof typeof grouped],
  }))
}
