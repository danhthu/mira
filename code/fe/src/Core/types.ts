/**
 * Union type dùng chung giữa tầng Core và các entity. Đặt ở Core vì Core nằm dưới
 * cùng — entity được import xuống đây, không có chiều ngược lại.
 */

export type PersonRole = 'child' | 'parent' | 'partner' | 'friend' | 'self' | 'other';

export type DunbarRing = 5 | 15 | 50;

/**
 * Sáu khoang của `02-data-model.md`, cộng `waste`. `08-three-pillars.md` gom thời
 * gian thành ba nhóm mà nhóm LÃNG PHÍ không ánh xạ được vào khoang nào trong sáu
 * khoang cũ — thiếu nó thì không tính nổi giờ cần thiết. Xem HANDOFF.md.
 */
export type TimeBucket = 'work' | 'health' | 'people' | 'learn' | 'rest' | 'self' | 'waste';

export type TimeEntrySource = 'manual' | 'calendar' | 'widget';

/** Ba nhóm của `08-three-pillars.md` §Trụ 1. `necessary` là phần dư, không ai ghi. */
export type TimeGroup = 'waste' | 'meaningful' | 'necessary';
