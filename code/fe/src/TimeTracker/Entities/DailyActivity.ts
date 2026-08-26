import { base } from '../../Common/Entities';

export class DailyActivity extends base{
  public name: string;
  public did: number;
  public end?: Date;
  public protected?:boolean;
  public timeCatId?: string;
}