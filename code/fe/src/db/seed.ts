import { db } from './client';
import { person, timeEntry, moment } from './schema';

// Dữ liệu mẫu — chỉ dùng trong môi trường development.
//
// Ngày phải tính tương đối theo hôm nay, không viết cứng: giờ vàng đọc cửa sổ
// 7 ngày gần nhất, nên seed gắn ngày cố định sẽ tự hết hạn sau một tuần và
// màn Hôm nay hiện "chưa đủ dữ liệu" dù DB có bản ghi.

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function hoursAgo(days: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const NOW = new Date().toISOString();
const CREATED = hoursAgo(48, 8, 0);

const PERSONS = [
  {
    id: 'pid-bao-an-01',
    name: 'Bảo An',
    role: 'child' as const,
    birthYear: 2023,
    distanceKm: null,
    dunbarRing: 5 as const,
    desiredCadence: 30,
    hourglassEnabled: false,
    createdAt: CREATED,
    updatedAt: CREATED,
    deletedAt: null,
  },
  {
    id: 'pid-linh-01',
    name: 'Linh',
    role: 'partner' as const,
    birthYear: null,
    distanceKm: null,
    dunbarRing: 5 as const,
    desiredCadence: 30,
    hourglassEnabled: false,
    createdAt: CREATED,
    updatedAt: CREATED,
    deletedAt: null,
  },
  {
    id: 'pid-bo-01',
    name: 'Bố',
    role: 'parent' as const,
    birthYear: 1960,
    distanceKm: 1700,
    dunbarRing: 5 as const,
    desiredCadence: 2,
    hourglassEnabled: false,
    createdAt: CREATED,
    updatedAt: CREATED,
    deletedAt: null,
  },
  {
    id: 'pid-me-01',
    name: 'Mẹ',
    role: 'parent' as const,
    birthYear: 1963,
    distanceKm: 1700,
    dunbarRing: 5 as const,
    desiredCadence: 2,
    hourglassEnabled: false,
    createdAt: CREATED,
    updatedAt: CREATED,
    deletedAt: null,
  },
  {
    id: 'pid-hung-01',
    name: 'Hùng',
    role: 'friend' as const,
    birthYear: null,
    distanceKm: null,
    dunbarRing: 15 as const,
    desiredCadence: 4,
    hourglassEnabled: false,
    createdAt: CREATED,
    updatedAt: CREATED,
    deletedAt: null,
  },
  {
    id: 'pid-self-01',
    name: 'Bản thân',
    role: 'self' as const,
    birthYear: null,
    distanceKm: null,
    dunbarRing: 5 as const,
    desiredCadence: 7,
    hourglassEnabled: false,
    createdAt: CREATED,
    updatedAt: CREATED,
    deletedAt: null,
  },
] satisfies (typeof person.$inferInsert)[];

// 7 ngày gần nhất (2026-08-12 → 2026-08-18)
// people + self → giờ vàng = 1125 phút = 18.8 giờ/tuần
const TIME_ENTRIES = [
  // Thứ 2
  { id: 'te-0812-01', date: daysAgo(6), minutes: 480, bucket: 'work' as const,   personId: null,            note: null,                          source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
  { id: 'te-0812-02', date: daysAgo(6), minutes:  60, bucket: 'people' as const, personId: 'pid-linh-01',   note: 'Ăn tối cùng nhau',            source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
  { id: 'te-0812-03', date: daysAgo(6), minutes:  45, bucket: 'people' as const, personId: 'pid-bao-an-01', note: 'Kể chuyện trước khi ngủ',      source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
  // Thứ 3
  { id: 'te-0813-01', date: daysAgo(5), minutes: 540, bucket: 'work' as const,   personId: null,            note: 'Deadline sprint',              source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
  { id: 'te-0813-02', date: daysAgo(5), minutes:  30, bucket: 'people' as const, personId: 'pid-bao-an-01', note: 'Chơi với con trước khi đi làm', source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
  // Thứ 4
  { id: 'te-0814-01', date: daysAgo(4), minutes: 480, bucket: 'work' as const,   personId: null,            note: null,                           source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
  { id: 'te-0814-02', date: daysAgo(4), minutes:  90, bucket: 'people' as const, personId: 'pid-linh-01',   note: 'Cả nhà đi ăn tối ngoài',       source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
  { id: 'te-0814-03', date: daysAgo(4), minutes:  60, bucket: 'self' as const,   personId: 'pid-self-01',   note: 'Tập thể dục',                  source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
  // Thứ 5
  { id: 'te-0815-01', date: daysAgo(3), minutes: 480, bucket: 'work' as const,   personId: null,            note: null,                           source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
  { id: 'te-0815-02', date: daysAgo(3), minutes:  30, bucket: 'people' as const, personId: 'pid-bo-01',     note: 'Gọi video với Bố',             source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
  { id: 'te-0815-03', date: daysAgo(3), minutes:  45, bucket: 'people' as const, personId: 'pid-bao-an-01', note: 'Tắm + đọc sách cùng con',       source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
  // Thứ 6
  { id: 'te-0816-01', date: daysAgo(2), minutes: 420, bucket: 'work' as const,   personId: null,            note: 'Về sớm',                       source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
  { id: 'te-0816-02', date: daysAgo(2), minutes: 120, bucket: 'people' as const, personId: 'pid-hung-01',   note: 'Cà phê chiều',                 source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
  { id: 'te-0816-03', date: daysAgo(2), minutes:  60, bucket: 'people' as const, personId: 'pid-linh-01',   note: 'Nói chuyện tối',               source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
  // Thứ 7
  { id: 'te-0817-01', date: daysAgo(1), minutes: 180, bucket: 'people' as const, personId: 'pid-bao-an-01', note: 'Đi công viên Tao Đàn',          source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
  { id: 'te-0817-02', date: daysAgo(1), minutes: 120, bucket: 'people' as const, personId: 'pid-linh-01',   note: 'Đi siêu thị cùng vợ',          source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
  { id: 'te-0817-03', date: daysAgo(1), minutes:  90, bucket: 'self' as const,   personId: 'pid-self-01',   note: 'Đọc sách buổi sáng',           source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
  // Chủ nhật (hôm nay)
  { id: 'te-0818-01', date: daysAgo(0), minutes:  60, bucket: 'people' as const, personId: 'pid-me-01',     note: 'Gọi điện với Mẹ',              source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
  { id: 'te-0818-02', date: daysAgo(0), minutes:  90, bucket: 'people' as const, personId: 'pid-bao-an-01', note: 'Chơi xếp hình cùng con',        source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
  { id: 'te-0818-03', date: daysAgo(0), minutes:  45, bucket: 'self' as const,   personId: 'pid-self-01',   note: 'Thiền 45 phút',                source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
] satisfies (typeof timeEntry.$inferInsert)[];

const MOMENTS = [
  {
    id: 'mom-01',
    occurredAt: hoursAgo(8, 19, 30),
    text: 'Bảo An lần đầu đọc được 10 chữ cái, chỉ vào từng chữ rồi nhìn bố cười',
    mediaUri: null,
    mediaType: null,
    personIds: JSON.stringify(['pid-bao-an-01']),
    bucket: 'people' as const,
    kind: 'moment' as const,
    createdAt: NOW,
    updatedAt: NOW,
    deletedAt: null,
  },
  {
    id: 'mom-02',
    occurredAt: hoursAgo(4, 20, 45),
    text: 'Cả nhà ăn bún bò cùng nhau. Linh cười rất nhiều vì Bảo An đòi ăn thêm',
    mediaUri: null,
    mediaType: null,
    personIds: JSON.stringify(['pid-linh-01', 'pid-bao-an-01']),
    bucket: 'people' as const,
    kind: 'moment' as const,
    createdAt: NOW,
    updatedAt: NOW,
    deletedAt: null,
  },
  {
    id: 'mom-03',
    occurredAt: hoursAgo(2, 17, 0),
    text: 'Hùng kể về startup mới đang làm. Nghe xong thấy mình cũng nên bắt đầu cái gì đó',
    mediaUri: null,
    mediaType: null,
    personIds: JSON.stringify(['pid-hung-01']),
    bucket: 'learn' as const,
    kind: 'moment' as const,
    createdAt: NOW,
    updatedAt: NOW,
    deletedAt: null,
  },
  {
    id: 'mom-04',
    occurredAt: hoursAgo(1, 9, 15),
    text: 'Bảo An chạy ra ôm bố khi thấy bố từ đằng xa đi vào công viên',
    mediaUri: null,
    mediaType: null,
    personIds: JSON.stringify(['pid-bao-an-01']),
    bucket: 'people' as const,
    kind: 'moment' as const,
    createdAt: NOW,
    updatedAt: NOW,
    deletedAt: null,
  },
  {
    id: 'mom-05',
    occurredAt: hoursAgo(0, 10, 45),
    text: 'Mẹ hỏi thăm sức khoẻ, kể chuyện bà nội mới khỏe hơn. Nghe giọng Mẹ thấy bình yên',
    mediaUri: null,
    mediaType: null,
    personIds: JSON.stringify(['pid-me-01']),
    bucket: 'people' as const,
    kind: 'moment' as const,
    createdAt: NOW,
    updatedAt: NOW,
    deletedAt: null,
  },
] satisfies (typeof moment.$inferInsert)[];

export async function seedDatabase(): Promise<void> {
  await db.delete(moment);
  await db.delete(timeEntry);
  await db.delete(person);

  await db.insert(person).values(PERSONS);
  await db.insert(timeEntry).values(TIME_ENTRIES);
  await db.insert(moment).values(MOMENTS);
}
