/** Đổi vai và nhịp gặp thành chữ. Tách khỏi JSX để không chuỗi nào nằm trong màn hình. */

import { PersonRole } from '../../Core/types';
import { WelcomeText } from '../Text';
import { CADENCE_DAILY } from './constants';

export function roleName(role: PersonRole, text: WelcomeText): string {
  if (role === 'child') return text.roleChild;
  if (role === 'parent') return text.roleParent;
  if (role === 'partner') return text.rolePartner;
  if (role === 'friend') return text.roleFriend;
  if (role === 'self') return text.roleSelf;
  return text.roleOther;
}

export function cadenceName(cadence: number, text: WelcomeText): string {
  if (cadence >= CADENCE_DAILY) return text.cadenceDaily;
  return `${cadence} ${text.cadenceTimesSuffix}`;
}
