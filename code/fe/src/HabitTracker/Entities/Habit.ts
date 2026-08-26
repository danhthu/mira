import { IsDefined, IsString } from 'class-validator';
import { base } from '../../Common/Entities/base';
import {
  checkListOption,
  goalOption,
  planOption,
  reminderOption,
  repeatOption,
  STATUS,
  tagOption,
} from '../../Common/Interfaces/interface';

export class Habit extends base {
  public repeatOption?: repeatOption;
  public reminderOption?: reminderOption;
  public icon?: string;
  public color?: string;
  @IsDefined()
  @IsString()
  public name: string;
  public endDate?: Date;
  public time?: Date;
  public style?: any;
  public priority?: number;
  public tags?: tagOption;
  public status?: STATUS; //tracker

  //tools
  public goalOption?: goalOption;
  public checkList?: checkListOption;
  public planOption?: planOption;
  //timetracker module
  public did?: number;
  public timeCatId?: string;

  //score
  public score?: number;
}
