// Điểm nối một chiều giữa kho cục bộ và tầng đồng bộ.
//
// Repo.ts chỉ biết tới file này, không biết `Common/Sync/` tồn tại. Nhờ vậy không
// có vòng lặp module (Sync import Repo để đọc DbProvider; Repo import Sync sẽ tạo
// vòng), và kho cục bộ vẫn chạy nguyên vẹn khi tầng đồng bộ chưa được nạp.

export interface LocalChange {
  table: string;
  id: string;
  /** Mili-giây epoch. Tầng đồng bộ tự đổi sang ISO 8601 theo hợp đồng. */
  updatedAt: number;
  /** Mili-giây epoch khi bản ghi bị xoá, null nếu còn sống. */
  deletedAt: number | null;
  data: Record<string, unknown>;
}

type LocalChangeSink = (change: LocalChange) => void;

let sink: LocalChangeSink | undefined;

/** Khoá theo `table:id` của những bản ghi đang được ghi xuống từ server. */
const applying = new Set<string>();

export function setLocalChangeSink(next: LocalChangeSink | undefined): void {
  sink = next;
}

export function markApplyingRemote(table: string, id: string): void {
  applying.add(table + ':' + id);
}

export function unmarkApplyingRemote(table: string, id: string): void {
  applying.delete(table + ':' + id);
}

export function emitLocalChange(change: LocalChange): void {
  if (!sink) return;
  // Bản ghi vừa lấy từ server không được xếp lại vào hàng đợi gửi đi, nếu không
  // mỗi vòng pull sẽ sinh ra một vòng push y hệt và hai bên vọng nhau vô hạn.
  if (applying.has(change.table + ':' + change.id)) return;
  sink(change);
}
