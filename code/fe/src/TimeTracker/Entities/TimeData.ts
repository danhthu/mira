import { base } from '../../Common/Entities';
import { repeatOption } from '../../Common/Interfaces';

export class TimeData extends base{
  public catId: string;
  public day: Date;
  public refId: string;
  public refTable:string;
  public label: string;
  public minut: number;
  repeatOption: repeatOption;
}