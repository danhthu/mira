import { Entity } from '../../Common';

export class timeSegment extends Entity.base{
  public title:string;
  public content?:string;
  public estimate?:number;
  public status?:string;
  public efficiency?:string;
  public wasteUnit?:string;
  public waste?:number;
  public rate?:number;
  public emotionStart?:string; //auto
  public emotionEnd?:string; //auto
  public endTime?:string; //
  public startTime?:number; //

  public priority?:boolean;
  public reminder?:boolean;
  public schedule?:boolean;
  public tag?:string;
  public tagStyle?:string;

}