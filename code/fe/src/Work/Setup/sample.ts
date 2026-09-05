import moment from 'moment';
import { getDay } from '../../Common/Utils/common';
import { Work, workRepository } from '../Entities';

const names = [
  'gọi cho bố mẹ',
  'gửi báo cáo tuần',
  'đặt lịch khám răng',
  'trả sách thư viện',
  'dọn hộp thư đến',
  'chuẩn bị bữa tối',
];

/**
 * Dữ liệu để xem thử màn hình, chỉ chạy khi có người gọi `AppSetup/sample`.
 *
 * Bản Batify sinh 365 ngày × 4–10 bản ghi tên `"Working 12"`, mỗi bản gán ngẫu
 * nhiên cờ bắt buộc và `did: 45`. Hai trường đó không có control nhập nào, nên
 * mọi con số trong màn thống kê đều đến từ đây chứ không từ người dùng.
 */
export async function sample() {
  await workRepository.empty();
  const today = getDay(new Date());
  const data = names.map((name, index) => ({
    ...new Work(),
    name,
    startDate: getDay(moment(today).add(index % 3, 'days').toDate()),
    status: index % 3 == 0 ? 'DONE' : 'PLAN',
  } as Work));
  await workRepository.adds(data);
  await workRepository.save();
}
