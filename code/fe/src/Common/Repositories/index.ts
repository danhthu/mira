
import { code } from '../Entities/code';
import { color } from '../Entities/color';
import { customer } from '../Entities/customer';
import { group } from '../Entities/group';
import { motivation } from '../Entities/motivation';
import { Reminder } from '../Entities/reminder';
import { tag } from '../Entities/tag';
import { getRepository, Repository } from './Repo';


export { getRepository, Repository };

export const codeRespository = getRepository<code>('code');
export const tagRespository = getRepository<tag>('tag');
export const colorRespository = getRepository<color>('color');

export const groupRepository = getRepository<group>('group');
export const customerRepository = getRepository<customer>('customer');
export const motivationRepository = getRepository<motivation>('motivation');
export const reminderRepository = getRepository<Reminder>('reminder');

