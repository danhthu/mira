// Union type dùng chung giữa entities/ và shared/dtos/ — chỉ khai kiểu, không logic.
// Ngoại lệ hẹp của luật "shared/ không import entities/, entities/ không import shared/":
// entities/ được phép import TỪ đây (chỉ file này, chỉ kiểu thuần) vì bản thân nó không
// phải DTO hay interface nghiệp vụ — tránh vòng lặp mà vẫn có một nguồn sự thật duy nhất
// cho mỗi union type, thay vì định nghĩa trùng ở cả entity lẫn DTO.
//
// Các union ở đây phải khớp CHECK constraint trong migrations/ và khớp
// `code/contract/src/index.ts`. Lệch một chỗ là lệch cả ba.
export type PersonRole = 'child' | 'parent' | 'partner' | 'friend' | 'self' | 'other';
export type DunbarRing = 5 | 15 | 50;

/** Catalog nhóm việc sau migration 002. Không có nhóm suy ra, không có chỉ số gộp. */
export type TimeBucket = 'work' | 'family' | 'personal' | 'waste';
/** `nep` là hàng do một nếp đã khai sinh ra, không phải thứ người dùng ngồi gõ. */
export type TimeEntrySource = 'manual' | 'widget' | 'nep';

/** Viên kẹo là ngày vui, hạt muối là ngày nặng. Không có mức độ ở giữa. */
export type MomentKind = 'candy' | 'salt';
export type SaltAnswer = 'same' | 'lighter' | 'gone';

export type GoalTier = 'long' | 'quarter' | 'rhythm';

export type MediaType = 'photo' | 'audio';
