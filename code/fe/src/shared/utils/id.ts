import { v7 as uuidv7 } from 'uuid';

// R-052: mọi bảng dùng id kiểu uuid v7 (sortable theo thời gian tạo).
export function generateId(): string {
  return uuidv7();
}
