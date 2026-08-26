import { base } from '../../Common/Entities';

export class TimeCat extends base{
  public name:string;
  public label:string;
  public color: string;
  public minPercentage: number;
  public maxPercentage: number;
  public protected?: boolean;
  public value?:number;
  public  total?:number;
  public day?:Date;
}