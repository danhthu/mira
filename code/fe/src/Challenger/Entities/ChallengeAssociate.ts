import { base } from '../../Common/Entities';

export interface ChallengeOption{
    type?:'Target' |'Times' |'DONE'|'ONTIME'|string ,
    link?: 'Work'|'Habit',
    value:number,
}
export class ChallengeAssociate extends base{
  public challengeId: string;
  public table: string;
  public tableId: string;
  public option: ChallengeOption;

}