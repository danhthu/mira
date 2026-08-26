import { Entity } from '../../Common';

export class wish extends Entity.base{
  public avaiable?:boolean;
  public text?: string;
  public style?:string;
}