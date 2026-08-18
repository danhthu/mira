import { db } from './client';
import { person, timeEntry, moment } from './schema';

// Dữ liệu mẫu — chỉ dùng trong môi trường development
// Ngày tham chiếu: 2026-08-18

const NOW = '2026-08-18T10:00:00+07:00';
const CREATED = '2026-07-01T08:00:00+07:00';

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
  { id: 'te-0812-01', date: '2026-08-12', minutes: 480, bucket: 'work' as const,   personId: null,            note: null,                          source: 'manual' as const, createdAt: '2026-08-12T20:00:00+07:00', updatedAt: '2026-08-12T20:00:00+07:00', deletedAt: null },
  { id: 'te-0812-02', date: '2026-08-12', minutes:  60, bucket: 'people' as const, personId: 'pid-linh-01',   note: 'Ăn tối cùng nhau',            source: 'manual' as const, createdAt: '2026-08-12T20:30:00+07:00', updatedAt: '2026-08-12T20:30:00+07:00', deletedAt: null },
  { id: 'te-0812-03', date: '2026-08-12', minutes:  45, bucket: 'people' as const, personId: 'pid-bao-an-01', note: 'Kể chuyện trước khi ngủ',      source: 'manual' as const, createdAt: '2026-08-12T21:00:00+07:00', updatedAt: '2026-08-12T21:00:00+07:00', deletedAt: null },
  // Thứ 3
  { id: 'te-0813-01', date: '2026-08-13', minutes: 540, bucket: 'work' as const,   personId: null,            note: 'Deadline sprint',              source: 'manual' as const, createdAt: '2026-08-13T20:30:00+07:00', updatedAt: '2026-08-13T20:30:00+07:00', deletedAt: null },
  { id: 'te-0813-02', date: '2026-08-13', minutes:  30, bucket: 'people' as const, personId: 'pid-bao-an-01', note: 'Chơi với con trước khi đi làm', source: 'manual' as const, createdAt: '2026-08-13T07:00:00+07:00', updatedAt: '2026-08-13T07:00:00+07:00', deletedAt: null },
  // Thứ 4
  { id: 'te-0814-01', date: '2026-08-14', minutes: 480, bucket: 'work' as const,   personId: null,            note: null,                           source: 'manual' as const, createdAt: '2026-08-14T20:00:00+07:00', updatedAt: '2026-08-14T20:00:00+07:00', deletedAt: null },
  { id: 'te-0814-02', date: '2026-08-14', minutes:  90, bucket: 'people' as const, personId: 'pid-linh-01',   note: 'Cả nhà đi ăn tối ngoài',       source: 'manual' as const, createdAt: '2026-08-14T20:30:00+07:00', updatedAt: '2026-08-14T20:30:00+07:00', deletedAt: null },
  { id: 'te-0814-03', date: '2026-08-14', minutes:  60, bucket: 'self' as const,   personId: 'pid-self-01',   note: 'Tập thể dục',                  source: 'manual' as const, createdAt: '2026-08-14T06:30:00+07:00', updatedAt: '2026-08-14T06:30:00+07:00', deletedAt: null },
  // Thứ 5
  { id: 'te-0815-01', date: '2026-08-15', minutes: 480, bucket: 'work' as const,   personId: null,            note: null,                           source: 'manual' as const, createdAt: '2026-08-15T20:00:00+07:00', updatedAt: '2026-08-15T20:00:00+07:00', deletedAt: null },
  { id: 'te-0815-02', date: '2026-08-15', minutes:  30, bucket: 'people' as const, personId: 'pid-bo-01',     note: 'Gọi video với Bố',             source: 'manual' as const, createdAt: '2026-08-15T21:00:00+07:00', updatedAt: '2026-08-15T21:00:00+07:00', deletedAt: null },
  { id: 'te-0815-03', date: '2026-08-15', minutes:  45, bucket: 'people' as const, personId: 'pid-bao-an-01', note: 'Tắm + đọc sách cùng con',       source: 'manual' as const, createdAt: '2026-08-15T20:00:00+07:00', updatedAt: '2026-08-15T20:00:00+07:00', deletedAt: null },
  // Thứ 6
  { id: 'te-0816-01', date: '2026-08-16', minutes: 420, bucket: 'work' as const,   personId: null,            note: 'Về sớm',                       source: 'manual' as const, createdAt: '2026-08-16T18:00:00+07:00', updatedAt: '2026-08-16T18:00:00+07:00', deletedAt: null },
  { id: 'te-0816-02', date: '2026-08-16', minutes: 120, bucket: 'people' as const, personId: 'pid-hung-01',   note: 'Cà phê chiều',                 source: 'manual' as const, createdAt: '2026-08-16T16:00:00+07:00', updatedAt: '2026-08-16T16:00:00+07:00', deletedAt: null },
  { id: 'te-0816-03', date: '2026-08-16', minutes:  60, bucket: 'people' as const, personId: 'pid-linh-01',   note: 'Nói chuyện tối',               source: 'manual' as const, createdAt: '2026-08-16T21:00:00+07:00', updatedAt: '2026-08-16T21:00:00+07:00', deletedAt: null },
  // Thứ 7
  { id: 'te-0817-01', date: '2026-08-17', minutes: 180, bucket: 'people' as const, personId: 'pid-bao-an-01', note: 'Đi công viên Tao Đàn',          source: 'manual' as const, createdAt: '2026-08-17T18:00:00+07:00', updatedAt: '2026-08-17T18:00:00+07:00', deletedAt: null },
  { id: 'te-0817-02', date: '2026-08-17', minutes: 120, bucket: 'people' as const, personId: 'pid-linh-01',   note: 'Đi siêu thị cùng vợ',          source: 'manual' as const, createdAt: '2026-08-17T14:00:00+07:00', updatedAt: '2026-08-17T14:00:00+07:00', deletedAt: null },
  { id: 'te-0817-03', date: '2026-08-17', minutes:  90, bucket: 'self' as const,   personId: 'pid-self-01',   note: 'Đọc sách buổi sáng',           source: 'manual' as const, createdAt: '2026-08-17T07:00:00+07:00', updatedAt: '2026-08-17T07:00:00+07:00', deletedAt: null },
  // Chủ nhật (hôm nay)
  { id: 'te-0818-01', date: '2026-08-18', minutes:  60, bucket: 'people' as const, personId: 'pid-me-01',     note: 'Gọi điện với Mẹ',              source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
  { id: 'te-0818-02', date: '2026-08-18', minutes:  90, bucket: 'people' as const, personId: 'pid-bao-an-01', note: 'Chơi xếp hình cùng con',        source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
  { id: 'te-0818-03', date: '2026-08-18', minutes:  45, bucket: 'self' as const,   personId: 'pid-self-01',   note: 'Thiền 45 phút',                source: 'manual' as const, createdAt: NOW, updatedAt: NOW, deletedAt: null },
] satisfies (typeof timeEntry.$inferInsert)[];

const MOMENTS = [
  {
    id: 'mom-01',
    occurredAt: '2026-08-10T19:30:00+07:00',
    text: 'Bảo An lần đầu đọc được 10 chữ cái, chỉ vào từng chữ rồi nhìn bố cười',
    mediaUri: null,
    mediaType: null,
    personIds: JSON.stringify(['pid-bao-an-01']),
    bucket: 'people' as const,
    createdAt: '2026-08-10T19:35:00+07:00',
    updatedAt: '2026-08-10T19:35:00+07:00',
    deletedAt: null,
  },
  {
    id: 'mom-02',
    occurredAt: '2026-08-14T20:45:00+07:00',
    text: 'Cả nhà ăn bún bò cùng nhau. Linh cười rất nhiều vì Bảo An đòi ăn thêm',
    mediaUri: null,
    mediaType: null,
    personIds: JSON.stringify(['pid-linh-01', 'pid-bao-an-01']),
    bucket: 'people' as const,
    createdAt: '2026-08-14T21:00:00+07:00',
    updatedAt: '2026-08-14T21:00:00+07:00',
    deletedAt: null,
  },
  {
    id: 'mom-03',
    occurredAt: '2026-08-16T17:00:00+07:00',
    text: 'Hùng kể về startup mới đang làm. Nghe xong thấy mình cũng nên bắt đầu cái gì đó',
    mediaUri: null,
    mediaType: null,
    personIds: JSON.stringify(['pid-hung-01']),
    bucket: 'learn' as const,
    createdAt: '2026-08-16T17:30:00+07:00',
    updatedAt: '2026-08-16T17:30:00+07:00',
    deletedAt: null,
  },
  {
    id: 'mom-04',
    occurredAt: '2026-08-17T09:15:00+07:00',
    text: 'Bảo An chạy ra ôm bố khi thấy bố từ đằng xa đi vào công viên',
    mediaUri: null,
    mediaType: null,
    personIds: JSON.stringify(['pid-bao-an-01']),
    bucket: 'people' as const,
    createdAt: '2026-08-17T09:20:00+07:00',
    updatedAt: '2026-08-17T09:20:00+07:00',
    deletedAt: null,
  },
  {
    id: 'mom-05',
    occurredAt: '2026-08-18T10:45:00+07:00',
    text: 'Mẹ hỏi thăm sức khoẻ, kể chuyện bà nội mới khỏe hơn. Nghe giọng Mẹ thấy bình yên',
    mediaUri: null,
    mediaType: null,
    personIds: JSON.stringify(['pid-me-01']),
    bucket: 'people' as const,
    createdAt: '2026-08-18T10:50:00+07:00',
    updatedAt: '2026-08-18T10:50:00+07:00',
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
