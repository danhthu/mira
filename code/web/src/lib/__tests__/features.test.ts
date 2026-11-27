/**
 * Canh cho công tắc web và file luật của máy chủ không trôi khỏi nhau.
 *
 * Hôm nay phiên làm việc này đã dính đúng lỗi "một sự thật thành hai bản" hai lần: kiểu
 * `YChi` chép đôi giữa `contract` và `be` (test xanh, build xanh, chết lúc khởi động),
 * rồi tới cờ giờ vàng. Lần này đặt một bài kiểm đọc thẳng file kia.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { GOLDEN_HOURS } from '../features';

const thuMucNay = dirname(fileURLToPath(import.meta.url));
const RULES_PATH = resolve(thuMucNay, '../../../../be/src/services/parse-rules.json');

describe('tinhNang vs parse-rules.json', () => {
  it('⚑ GOLDEN_HOURS của web bằng goldenHours của máy chủ', () => {
    // Lệch nhau thì máy chủ thôi gắn cờ vàng trong khi giao diện vẫn bày một khái niệm
    // đã chết — hoặc ngược lại, dữ liệu có cờ mà không chỗ nào hiện.
    const luat = JSON.parse(readFileSync(RULES_PATH, 'utf8')) as { goldenHours: boolean };
    expect(GOLDEN_HOURS).toBe(luat.goldenHours);
  });

  it('file luật đọc được và còn đúng chỗ', () => {
    // Đổi đường dẫn file luật mà quên bài kiểm này thì nó im lặng vô dụng.
    expect(() => readFileSync(RULES_PATH, 'utf8')).not.toThrow();
  });
});
