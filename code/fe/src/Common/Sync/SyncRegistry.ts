import { base } from '../Entities/base';
import { Repository } from '../Repositories/Repo';
import { isSyncedTable } from './constants';

const repositories = new Map<string, Repository<base>>();

/**
 * Nối một repository vào tầng đồng bộ. Tên bảng phải nằm trong 13 bảng của hợp
 * đồng; repository nào khác vẫn chạy cục bộ y như cũ và không rời khỏi máy.
 */
export function registerSyncedRepository<T extends base>(
  table: string,
  repository: Repository<T>,
): void {
  if (!isSyncedTable(table)) {
    throw new Error('Table "' + table + '" is not in the sync contract table list');
  }
  // Repository<T> chỉ đọc/ghi qua giao diện của `base` khi áp thay đổi từ server;
  // các trường riêng của T nằm trong `data` và được copy nguyên khối.
  repositories.set(table, repository as unknown as Repository<base>);
}

export function getSyncedRepository(table: string): Repository<base> | undefined {
  return repositories.get(table);
}

export function registeredTables(): string[] {
  return Array.from(repositories.keys());
}

export function clearSyncedRepositories(): void {
  repositories.clear();
}
