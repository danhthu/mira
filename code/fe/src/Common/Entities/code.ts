import { base } from './base';

export class code extends base{
  public cat: string;
  public code:string;
  public name?:string;
  public icon? :string;
}

export class codeLocaltion extends code{
  public countryCode:string;
}