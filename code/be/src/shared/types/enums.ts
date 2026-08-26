// Union type dùng chung giữa entities/ và shared/dtos/ — chỉ khai kiểu, không logic.
// Ngoại lệ hẹp của luật "shared/ không import entities/, entities/ không import shared/":
// entities/ được phép import TỪ đây (chỉ file này, chỉ kiểu thuần) vì bản thân nó không
// phải DTO hay interface nghiệp vụ — tránh vòng lặp mà vẫn có một nguồn sự thật duy nhất
// cho mỗi union type, thay vì định nghĩa trùng ở cả entity lẫn DTO.
export type PersonRole = 'child' | 'parent' | 'partner' | 'friend' | 'self' | 'other';
export type DunbarRing = 5 | 15 | 50;
export type TimeBucket = 'work' | 'health' | 'people' | 'learn' | 'rest' | 'self';
export type TimeEntrySource = 'manual' | 'calendar' | 'widget';
export type MediaType = 'photo' | 'audio';
