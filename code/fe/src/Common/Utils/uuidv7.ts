// Hợp đồng đồng bộ (docs/09-sync-contract.md, mục Nguyên tắc 2) yêu cầu client tự
// sinh id dạng UUID v7: 48 bit đầu là mốc thời gian mili-giây nên id sắp được theo
// thời gian, phần còn lại ngẫu nhiên nên hai máy không đụng nhau.
// Gói `uuid@9` trong dự án chưa có v7 (chỉ từ v10), nên viết tay ở đây.

const HEX = '0123456789abcdef';

function randomBytes(target: Uint8Array): void {
  const source: Crypto | undefined = (globalThis as { crypto?: Crypto }).crypto;
  if (source && typeof source.getRandomValues === 'function') {
    source.getRandomValues(target);
    return;
  }
  // JSC bản cũ trên Android không có crypto.getRandomValues. Id ở đây chỉ cần duy
  // nhất giữa vài thiết bị của cùng một người, không dùng làm bí mật, nên
  // Math.random đủ dùng khi thiếu nguồn ngẫu nhiên của hệ điều hành.
  for (let i = 0; i < target.length; i += 1) {
    target[i] = Math.floor(Math.random() * 256);
  }
}

function toHex(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) {
    out += HEX[bytes[i] >> 4] + HEX[bytes[i] & 0x0f];
    if (i === 3 || i === 5 || i === 7 || i === 9) out += '-';
  }
  return out;
}

export function uuidv7(): string {
  const bytes = new Uint8Array(16);
  const millis = Date.now();

  // 48 bit mốc thời gian, big-endian. Chia thay vì dịch bit vì số vượt 32 bit.
  bytes[0] = Math.floor(millis / 0x10000000000) & 0xff;
  bytes[1] = Math.floor(millis / 0x100000000) & 0xff;
  bytes[2] = (millis >>> 24) & 0xff;
  bytes[3] = (millis >>> 16) & 0xff;
  bytes[4] = (millis >>> 8) & 0xff;
  bytes[5] = millis & 0xff;

  const random = new Uint8Array(10);
  randomBytes(random);
  bytes.set(random, 6);

  bytes[6] = (bytes[6] & 0x0f) | 0x70; // version 7
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant RFC 4122

  return toHex(bytes);
}
