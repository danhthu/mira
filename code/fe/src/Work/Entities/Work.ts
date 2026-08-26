


import { checkListOption, reminderOption, repeatOption, STATUS } from '../../../src/Common/Interfaces/interface';
import { Entity } from '../../Common';

export class Timespan {
  public hour?: number;
  public minute?: number;
  public second?: number;
}

export class Work extends Entity.base {
  public kind?: 'todo' | 'group';
  public icon?: string;
  public color?: any;

  public name: string;
  public priority?: string;
  public estimated?: number; //estimat time minute
  public finishDate?: Date; //

  public endDate?: Date; //deadline

  public startDate?: Date; //start
  public timeStart?: Timespan;
  public doing?: number; //time focus
  public did?: number; //total time complete
  public focus?: boolean; //focus workd

  public mandatory?: boolean;

  //tools
  public repeatOption?: repeatOption; //json
  public reminderOption?: reminderOption;
  public tags?: string[];
  public checkList?: checkListOption;
  public ref?: string;

  //
  public workRef?: string; //groups
  public deps?: string;

  public status?: STATUS;
  public timeCatId?: string;

}

