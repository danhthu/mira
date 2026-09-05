/**
 * Cửa duy nhất ra ngoài module. `Common/Screens/{SettingScreen,Container}.tsx` chỉ
 * import file này — một dòng mỗi bên — để bề mặt phụ thuộc còn đúng một chỗ khi cụm
 * cấu hình được dọn xuống `Common/` về sau (xem HANDOFF.md).
 */

import { Container, Overview, SettingsSections } from './Screens';
import { HOURGLASS_ROUTE, PERSON_ROUTE } from './Screens';

export { useQuietTime } from './Hooks/useQuietTime';
export type { QuietTimeView } from './Hooks/useQuietTime';
export type { QuietReason, QuietTimeSettings } from './Models/quietTime';
export { isQuietAt, quietReasonAt } from './Models/quietTime';

export const HourglassApp = {
  Screens: { Container, Overview, SettingsSections },
  Routes: { hourglass: HOURGLASS_ROUTE, person: PERSON_ROUTE },
};
