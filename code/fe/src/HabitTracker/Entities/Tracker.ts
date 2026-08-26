import { base } from '../../Common/Entities/base';
import {
  checkListOption,
  goalOption,
  planOption,
} from '../../Common/Interfaces';
import { STATUS } from '../../Common/Interfaces/interface';
import { getDay } from '../../Common/Utils/common';
import { Habit } from './Habit';

export class HabitTracker extends base {
  public hid: string;
  public day: number; //unix
  public hour?: number = 0;
  public minut?: number = 0;
  public second?: number = 0;
  public status?: STATUS;
  public checkIn?: number; //time checkin
  public data?: {
    goal?: goalOption
    checkList?: checkListOption
    plan?: planOption
  }; //json array

  public timeCatId?: string;
  public label?: string;
  public did?: number; //thoi gian thuc hien

  constructor(
    hid: string,
    day: number,
    goal?: goalOption,
    checkList?: checkListOption,
    status?: STATUS,
    label?: string,
    timeCatId?: string,
    did?: number,
  ) {
    super();
    this.hid = hid;
    this.day = getDay(new Date(day)).getTime();
    this.status = status;
    this.data = { goal, checkList };
    this.timeCatId = timeCatId;
    this.did = did;
    this.label = label; //
    this.status = status;
  }
  public static getDoneTracker(
    habit: Habit,
    day: number,
    goal?: goalOption,
    checkList?: checkListOption,
  ) {
    const tracker = new HabitTracker(
      habit.id,
      day,
      goal,
      checkList,
      'DONE',
      habit.name,
      habit.timeCatId,
      habit.did,
    );
    tracker.label = habit.name;
    return tracker;
  }
}
