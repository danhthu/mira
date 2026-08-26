import { base } from '../../Common/Entities';

export class SmartGoal extends base{
  public name:string;
  public icon? :string;
  public start?: Date;
  public end? : Date;
  public gif? :string;
  public status?:  'CREATED'|'DOING'|'FAILURE'|'SUCCESS';
  public milestones?:Array<Milestone>;
}

export class Milestone{
  public name:string;
  public status?:boolean;
  public desc:string;
  public date?:Date;
}