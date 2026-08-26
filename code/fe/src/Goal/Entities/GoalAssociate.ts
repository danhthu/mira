import { base } from '../../Common/Entities';

export interface GoalOption {
  link: string,
  type: string,
  value: number,
}

export class GoalAssociate extends base {
  public goalId: string;
  public table: string;
  public tableId: string;
  public option: GoalOption;
}