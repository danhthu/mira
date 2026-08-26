import { getRepository } from '../../Common/Repositories';
import { SmartGoal } from './Goal';
import { GoalAssociate  } from './GoalAssociate';
export const goalRepository = getRepository<SmartGoal>('Goal');

export const goalAssociateRepository =  getRepository<GoalAssociate>('GoalAssociate');