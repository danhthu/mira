export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}p`;
}

export function formatVND(amountVND: number): string {
  if (amountVND >= 1_000_000_000) {
    return `${(amountVND / 1_000_000_000).toFixed(1)} tỷ`;
  }
  if (amountVND >= 1_000_000) {
    return `${(amountVND / 1_000_000).toFixed(1)} triệu`;
  }
  if (amountVND >= 1_000) {
    return `${(amountVND / 1_000).toFixed(0)}k`;
  }
  return `${amountVND}đ`;
}

export function formatPersonIds(json: string): string[] {
  try {
    const parsed: unknown = JSON.parse(json);
    if (Array.isArray(parsed)) {
      return parsed.filter((x): x is string => typeof x === 'string');
    }
    return [];
  } catch {
    return [];
  }
}

export function serializeStringArray(arr: string[]): string {
  return JSON.stringify(arr);
}
