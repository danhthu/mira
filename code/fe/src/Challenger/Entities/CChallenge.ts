import { base } from '../../Common/Entities';

export class Challenge extends base{
  public name:string;
  public cat: string;
  public icon? :string;
  public start?: Date;
  public end? : Date;
  public gif?: string;
  public gif_icon?:string;
  public status?:  'CREATED'|'DOING'|'FAILURE'|'SUCCESS';
  public group?:string;
}