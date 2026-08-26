import { v7 as uuidv7 } from 'uuid';

// UUID v7 sắp xếp được theo thời gian tạo — id mới luôn lớn hơn id cũ, nên index
// trên khoá chính không bị phân mảnh như UUID v4. Dùng cùng thư viện với code/fe
// để id sinh ở app và ở backend cùng một dạng.
export function newId(): string {
  return uuidv7();
}
