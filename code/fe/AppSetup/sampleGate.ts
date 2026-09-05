/**
 * `AppSetup/sample` sinh gần một năm bản ghi ngẫu nhiên (4-10 việc/ngày) và phải
 * chạy sau `AppSetup/clean`, tức là nó xoá sạch kho cục bộ. Đó là công cụ của người
 * phát triển, không phải trạng thái khởi đầu của người dùng.
 *
 * Cổng hai lớp: `__DEV__` là hằng số bị nhồi lúc đóng gói nên bản phát hành không
 * có đường bật nhầm, còn biến môi trường bắt người phát triển phải khai báo rõ ràng
 * cho từng phiên chạy thay vì bật ngầm.
 */
export function shouldSeedSampleData(): boolean {
  return __DEV__ && process.env.EXPO_PUBLIC_MIRA_SEED_SAMPLE === '1'
}
