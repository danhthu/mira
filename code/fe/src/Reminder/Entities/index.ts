import { reminderOption } from '../../../common/interface';
import { base } from '../../Common/Entities';
import { getRepository } from '../../Common/Repositories';

export class Reminder  extends base{
  public option?:reminderOption;
}

export const reminderRepository = getRepository<Reminder>('Reminder');