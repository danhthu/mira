
import { code } from '../Entities/code';
import { color } from '../Entities/color';
import { customer } from '../Entities/customer';
import { group } from '../Entities/group';
import { Money } from '../Entities/money';
import { motivation } from '../Entities/motivation';
import { Person } from '../Entities/person';
import { Reminder } from '../Entities/reminder';
import { tag } from '../Entities/tag';
import { TimeEntry } from '../Entities/timeEntry';
import { getRepository, Repository } from './Repo';


export { getRepository, Repository };

export const codeRespository = getRepository<code>('code');
export const tagRespository = getRepository<tag>('tag');
export const colorRespository = getRepository<color>('color');

export const groupRepository = getRepository<group>('group');
export const customerRepository = getRepository<customer>('customer');
export const motivationRepository = getRepository<motivation>('motivation');
export const reminderRepository = getRepository<Reminder>('reminder');

// Ba bảng Mira. Tên bảng phải khớp allowlist trong `../Sync/constants.ts` thì tầng
// đồng bộ mới nhận — đặt sai tên là dữ liệu ghi cục bộ nhưng không bao giờ đẩy lên.
export const personRepository = getRepository<Person>('person');
export const timeEntryRepository = getRepository<TimeEntry>('time_entry');
export const moneyRepository = getRepository<Money>('money');

